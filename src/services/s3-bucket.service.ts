import * as AWS from 'aws-sdk';
import { ListObjectsV2Request, ObjectList } from 'aws-sdk/clients/s3';

export default class S3BucketService {
  private s3: AWS.S3 = new AWS.S3();

  async getDownloadLink(bucket: string, key: string): Promise<string> {
    const options = {
      Bucket: bucket,
      Key: key,
    };

    return this.s3.getSignedUrlPromise('getObject', options);
  }

  async getDownloadLinks(bucket: string): Promise<string[]> {
    const options: ListObjectsV2Request = {
      Bucket: bucket,
    };

    const objs = await this.s3.listObjectsV2(options).promise();
    const keys: ObjectList | undefined = objs.Contents;

    const downloadLinkPromises: Promise<string>[] = [];

    console.log(keys);
    keys?.forEach((k) => {
      downloadLinkPromises.push(
        this.getDownloadLink(bucket, k.Key || ''),
      );
    });

    return Promise.all(downloadLinkPromises);
  }
}
