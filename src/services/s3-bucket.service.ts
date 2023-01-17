import AWS from "aws-sdk";
import { ListObjectsV2Request, ObjectList } from "aws-sdk/clients/s3";

export default class S3BucketService {
  static s3: AWS.S3 = new AWS.S3();

  public static async upload(bucket: string, key: string, content: string) {
    return S3BucketService.s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: content,
      })
      .promise();
  }

  public static async download(bucket: string, key: string) {
    return (
      await S3BucketService.s3.getObject({ Bucket: bucket, Key: key }).promise()
    ).Body;
  }

  public static async getDownloadLink(
    bucket: string,
    key: string
  ): Promise<string> {
    const options = {
      Bucket: bucket,
      Key: key,
    };

    return S3BucketService.s3.getSignedUrlPromise("getObject", options);
  }

  public static async getDownloadLinks(
    bucket: string,
    prefix?: string
  ): Promise<string[]> {
    const options: ListObjectsV2Request = {
      Bucket: bucket,
      Prefix: prefix,
    };

    const objs = await S3BucketService.s3.listObjectsV2(options).promise();
    const keys: ObjectList | undefined = objs.Contents;

    const downloadLinkPromises: Promise<string>[] = [];

    keys
      ?.filter((k) => (k.Size ?? -1) > 0)
      .forEach((k) => {
        downloadLinkPromises.push(
          S3BucketService.getDownloadLink(bucket, k.Key || "")
        );
      });

    return Promise.all(downloadLinkPromises);
  }
}
