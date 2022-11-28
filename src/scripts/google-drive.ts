import { google, Auth } from "googleapis";

const auth = new Auth.GoogleAuth({
  keyFilename: "./src/scripts/robrendellwebsite-f2eb9ef8f812.json",
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
  ],
});
const service = google.drive({ version: "v3", auth });

async function downloadFile(realFileId: string) {
  console.log(await service.files.list());
  console.log(await service.drives.list());
  console.log(await service.permissions.list());
  // const file = await service.files.get({
  //   fileId: realFileId,
  //   alt: 'media',
  // });
  // console.log(file.status);
  // return file.status;
}

// async function uploadFile() {
//   const fileMetadata = {
//     name: 'photo.jpg',
//   };
//   const media = {
//     mimeType: 'image/jpeg',
//     body: fs.createReadStream('files/photo.jpg'),
//   };
//   const file = await service.files.create({
//     resource: fileMetadata,
//     media: media,
//     fields: 'id',
//   });
// }

downloadFile("Word")
  .then((result) => {
    console.log("Finished running");
  })
  .catch((error) => {
    console.error(error);
  });
