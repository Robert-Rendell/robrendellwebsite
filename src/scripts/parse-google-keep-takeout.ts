import fs from "fs";
import path from "path";
import AWS from "aws-sdk";
import {
  KeepNote,
  KeepNoteLabel,
} from "./typing/parse-google-keep-takeout.models";
/**
 * Overview:
 * - Google Keep API is only for enterprise level users
 * - As a result I've had to use Google Takeout to export Google Keep notes / images
 * - This script parses the unzipped takeout folders and uploads the json keep notes and the images
 *   associated with the notes.
 * Instructions:
 * - Use Google Takeout to export Google Keep
 * - Download the zip(s)
 * - Run:
 *   - $ npx ts-node ./src/scripts/parse-google-keep-takeout.ts
 */
const executeS3UploadEnabled = true;
const logFilenames = false;
const targetDir = "/home/rob/Downloads";
const targetBucket = "robrendellwebsite-photosivetaken";
const targetKeyPrefix = "nature/wild-flowers";
const targetLabel: KeepNoteLabel = {
  name: "AAA Flowers",
};

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_REGION || "eu-west-1",
});
const s3 = new AWS.S3();

const getRawKeepNote = (folder: string, filename: string): Buffer =>
  fs.readFileSync(path.join(targetDir, folder, "Takeout", "Keep", filename));

const getKeepNote = (folder: string, filename: string): KeepNote =>
  JSON.parse(getRawKeepNote(folder, filename).toString());

const filterNotesByLabel = (opts: {
  targetLabel: KeepNoteLabel;
  takeoutFolderFilenames: string[];
  fileTypes: { add: (arg0: string) => void };
  folder: string;
  fileExt: "json";
}) =>
  opts.takeoutFolderFilenames.filter((filename: string) => {
    opts.fileTypes.add(path.extname(filename));
    if (filename.includes(opts.fileExt)) {
      const keepNote: KeepNote = getKeepNote(opts.folder, filename);
      return keepNote.labels?.find(
        (label) => label.name === opts.targetLabel.name
      );
    }
    return false;
  });

const resolveAttachments = (opts: {
  takeoutFolders: string[];
  folder: string;
  attachmentFilenames: (string | undefined)[];
}) => {
  const errors: (string | undefined)[] = [];
  const resolvedAttachments = opts.attachmentFilenames.map((d) => {
    const fixedFileExtensioFilename = d?.replace("jpeg", "jpg") || "BIG ERROR";
    try {
      getRawKeepNote(opts.folder, fixedFileExtensioFilename);
      return {
        resolvedFolder: opts.folder,
        filename: fixedFileExtensioFilename,
      };
    } catch (error) {
      const otherFolders = opts.takeoutFolders.filter((f) => f !== opts.folder);
      try {
        getRawKeepNote(otherFolders[0], fixedFileExtensioFilename);
        return {
          resolvedFolder: otherFolders[0],
          filename: fixedFileExtensioFilename,
        };
      } catch (error2) {
        errors.push(d);
      }
    }
    throw Error(
      "Should have found the file by now, only using otherFolders[0] just now."
    );
  });
  console.log("Errors", errors);
  return resolvedAttachments;
};

/**
 * Script begins here:
 * --------------------------------------------------------------------------------
 */
const targetDirContents = fs.readdirSync(targetDir);
const takeoutFolders = targetDirContents.filter(
  (filename: string) =>
    filename.startsWith("takeout-") && !filename.endsWith(".zip")
);

takeoutFolders.forEach((folder: string) => {
  const takeoutFolderFilenames = fs.readdirSync(
    path.join(targetDir, folder, "Takeout", "Keep")
  );
  const fileTypes = new Set();
  const jsonNoteFilenames = filterNotesByLabel({
    targetLabel,
    takeoutFolderFilenames,
    fileTypes,
    folder,
    fileExt: "json",
  });
  const attachments = jsonNoteFilenames.map((filename) =>
    getKeepNote(folder, filename).attachments?.filter(
      (attachment) => typeof attachment !== "undefined"
    )
  );
  const allAttachmentFilenames = attachments
    .flat()
    .map((a) => a?.filePath)
    .filter((a) => typeof a !== "undefined");

  console.log("------------", "folder: ", folder, "------------");
  console.log("Files: ", takeoutFolderFilenames.length);
  console.log("Attachments:", allAttachmentFilenames.length);
  console.log(targetLabel.name, "(json):", jsonNoteFilenames.length);
  console.log("------------", fileTypes, "------------");
  if (logFilenames) {
    jsonNoteFilenames.forEach((flowerFilename: string) => {
      console.log(flowerFilename);
    });
  }

  const resolvedAttachmentFilenames = resolveAttachments({
    takeoutFolders,
    folder,
    attachmentFilenames: allAttachmentFilenames,
  });

  if (executeS3UploadEnabled) {
    // Only works for one folder just now
    const jsonPromises = jsonNoteFilenames.map((filename) => {
      console.log("Uploading: ", folder, filename);
      return s3
        .upload({
          Bucket: targetBucket,
          Key: `${targetKeyPrefix}/jsons/${filename}`,
          Body: getRawKeepNote(folder, filename),
        })
        .promise();
    });

    const imgPromises = resolvedAttachmentFilenames.map(
      ({ resolvedFolder, filename }) => {
        console.log("Uploading: ", resolvedFolder, filename);
        return s3
          .upload({
            Bucket: targetBucket,
            Key: `${targetKeyPrefix}/${filename}`,
            Body: getRawKeepNote(resolvedFolder, filename),
          })
          .promise();
      }
    );

    Promise.all([...jsonPromises, ...imgPromises])
      .then(() => {
        console.log(
          "Success!",
          jsonPromises.length + imgPromises.length,
          "file(s) uploaded to S3"
        );
      })
      .catch((error) => {
        console.log("Error!", error);
      });
  } else {
    console.warn("executeS3UploadEnabled = false: SKIPPING");
  }
});
