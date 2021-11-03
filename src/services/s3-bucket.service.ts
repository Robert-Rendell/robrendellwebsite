import * as AWS from 'aws-sdk';

export default class S3BucketService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3();
  }

  async getDownloadLink(bucket: string, key: string) {
    const options = {
      Bucket: bucket,
      Key: key,
    };

    await this.s3.getSignedUrlPromise('getObject', options);
  }
}
