import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';

/**
 * Instructions:
 * - Use Google Takeout to export Google Keep
 * - Download the zip(s)
 * - Run:
 *   - $ npx ts-node ./src/scripts/parse-google-keep-takeout.ts
 */
const executeS3UploadEnabled = false;
const logFilenames = false;
const targetDir = '/home/rob/Downloads';

AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-west-1',
});
const s3 = new AWS.S3();

type KeepNoteLabel = {
    name: string
}
type KeepNoteAttachment = {
    filePath: string,
    mimetype: string,
}
type KeepNote = {
    color: string,
    isTrashed: boolean,
    isPinned: boolean,
    isArchived: boolean,
    textContent: string,
    title: string,
    userEditedTimestampUsec: number,
    createdTimestampUsec: number,
    labels?: KeepNoteLabel[],
    attachments?: KeepNoteAttachment[],
};

const flowersLabel: KeepNoteLabel = {
  name: 'AAA Flowers',
};

const getRawKeepNote = (
  folder: string,
  filename: string,
): Buffer => fs.readFileSync(path.join(targetDir, folder, 'Takeout', 'Keep', filename));

const getKeepNote = (
  folder: string,
  filename: string,
): KeepNote => JSON.parse(
  getRawKeepNote(folder, filename).toString(),
);

const filterNotesByLabel = (
  targetLabel: KeepNoteLabel,
  takeoutFolderFilenames: string[],
  fileTypes: { add: (arg0: string) => void; },
  folder: string,
  fileExt = 'json',
) => takeoutFolderFilenames.filter((filename: string) => {
  fileTypes.add(path.extname(filename));
  if (filename.includes(fileExt)) {
    const keepNote: KeepNote = getKeepNote(folder, filename);
    // console.log(keepNote.labels);
    return keepNote.labels?.find((label) => label.name === targetLabel.name);
  }
  return false;
});

const targetDirContents = fs.readdirSync(targetDir);
const takeoutFolders = targetDirContents.filter((filename: string) => filename.startsWith('takeout-') && !filename.endsWith('.zip'));

takeoutFolders.forEach((folder: string) => {
  const takeoutFolderFilenames = fs.readdirSync(path.join(targetDir, folder, 'Takeout', 'Keep'));
  const fileTypes = new Set();
  const flowerNoteFilenames = filterNotesByLabel(
    flowersLabel, takeoutFolderFilenames, fileTypes, folder,
  );
  console.log('------------', 'folder: ', folder, '------------');
  console.log('Files: ', takeoutFolderFilenames.length);
  console.log(flowersLabel.name, flowerNoteFilenames.length);
  console.log('------------', fileTypes, '------------');
  if (logFilenames) {
    flowerNoteFilenames.forEach((flowerFilename: string) => {
      console.log(flowerFilename);
    });
  }

  if (executeS3UploadEnabled) {
    const promises = flowerNoteFilenames.map((flowerNoteFilename: string) => s3.upload({
      Bucket: 'robrendellwebsite-photosivetaken',
      Key: `wild-flowers/${flowerNoteFilename}`,
      Body: getRawKeepNote(folder, flowerNoteFilename),
    }).promise());

    Promise.all(promises).then(() => {
      console.log('Success!', promises.length, ' file(s) uploaded to S3');
    }).catch((error) => {
      console.log('Error!', error);
    });
  } else {
    console.warn('executeS3UploadEnabled = false: SKIPPING');
  }
});
