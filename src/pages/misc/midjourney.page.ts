import S3, { ObjectList } from "aws-sdk/clients/s3";
import { Request, Response } from "express";
import { ConfigService } from "../../services/config.service";
import S3BucketService from "../../services/s3-bucket.service";

/**
 * https://<robrendellwebsite-public>.s3.eu-west-1.amazonaws.com/images/midjourney/shiva-archetypes_halos_magnetism_waves_two_people_with_their_he_4e7c78b5-e962-4e96-b26e-ac6f980ca211.png
 * @param req
 * @param res
 */
export async function MidjourneyCreationsPage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const prefix = "images/midjourney";
    const region = "eu-west-1";
    const bucket = ConfigService.PublicBucket;
    const options: S3.ListObjectsV2Request = {
      Bucket: bucket,
      Prefix: `${prefix}/`,
    };
    const objs = await S3BucketService.s3.listObjectsV2(options).promise();
    const keys: ObjectList | undefined = objs.Contents;

    res
      .status(200)
      .send(
        keys
          ?.filter((k) => (k.Size ?? -1) > 0)
          .map((k) => `https://${bucket}.s3.${region}.amazonaws.com/${k.Key}`)
      );
  } catch (e) {
    res.status(500).send(e);
  }
}
