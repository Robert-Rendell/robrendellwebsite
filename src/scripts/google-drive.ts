/* eslint-disable import/no-extraneous-dependencies */
import { google, Auth } from 'googleapis';
// import { GoogleAuth } from 'google-auth-library';

async function downloadFile(realFileId: string) {
  const auth = new Auth.GoogleAuth({
    keyFilename: './src/scripts/robrendellwebsite-f2eb9ef8f812.json',
    scopes: 'https://www.googleapis.com/auth/drive',
  });
  const service = google.drive({ version: 'v3', auth });

  console.log(await service.files.list());
  const file = await service.files.get({
    fileId: realFileId,
    alt: 'media',
  });
  console.log(file.status);
  return file.status;
}

downloadFile('takeout-20221028T151914Z-001.zip').then((result) => {
  console.log('Finished running');
}).catch((error) => {
  console.error(error);
});
