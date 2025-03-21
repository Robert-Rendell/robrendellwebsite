import AWS from "aws-sdk";
import S3, {
  DeleteObjectsRequest,
  ListObjectsV2Request,
  ObjectList,
} from "aws-sdk/clients/s3";
import { ConfigService } from "../config.service";
import { S3BucketOfflineStubs } from "./s3-bucket-offline-stubs";

export default class S3BucketService {
  private static s3Object: AWS.S3 | null = null;
  static {
    if (!this.isOffline) {
      const credentials = {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        accessKeyId: process.env.AWS_ACCESS_KEY || "",
        region: process.env.AWS_REGION || "eu-west-1",
      };
      S3BucketService.s3Object = new AWS.S3({ credentials });
    }
  }

  public static get s3() {
    if (!S3BucketService.s3Object) {
      throw S3BucketService.nullS3ObjectError();
    }
    return S3BucketService.s3Object;
  }

  public static nullS3ObjectError() {
    return Error("s3 instance in s3-bucket.service.ts not initialised");
  }

  private static get isOffline() {
    return ConfigService.AppHost.includes("http://localhost");
  }

  public static async upload(bucket: string, key: string, content: string) {
    return S3BucketService.s3Object
      ?.upload({
        Bucket: bucket,
        Key: key,
        Body: content,
      })
      .promise();
  }

  public static async download(bucket: string, key: string) {
    if (S3BucketService.isOffline || !S3BucketService.s3Object) {
      console.log(bucket, key);
      const s3FilePath = `${bucket}/${key}`;
      const stub = S3BucketOfflineStubs[s3FilePath];
      if (!stub) {
        throw Error(`Missing S3 Bucket stub for ${s3FilePath}`);
      }
      return JSON.stringify(stub);
    }
    const s3Object = await S3BucketService.s3Object
      .getObject({ Bucket: bucket, Key: key })
      .promise();
    return s3Object.Body;
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

  public static async deleteFolder(bucket: string, prefix?: string) {
    const options: ListObjectsV2Request = {
      Bucket: bucket,
      Prefix: prefix,
    };
    const objs = await S3BucketService.s3.listObjectsV2(options).promise();
    const keys: ObjectList | undefined = objs.Contents;

    if (!keys) throw Error("No objects to delete");

    const req: DeleteObjectsRequest = {
      Bucket: bucket,
      Delete: {
        Objects: keys
          .filter((k) => (k.Size ?? -1) > 0 && typeof k.Key !== "undefined")
          .map((a) => ({ Key: a.Key as string })),
      },
    };

    console.log(`Going to delete: ${JSON.stringify(req, null, 2)}`);
    await S3BucketService.s3.deleteObjects(req).promise();
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
