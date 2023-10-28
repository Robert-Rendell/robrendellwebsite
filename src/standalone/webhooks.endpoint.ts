import { Request, Response } from "express";
import { ConfigService } from "../services/config.service";
import S3BucketService from "../services/s3-bucket.service";

export const WebhooksEndpoint = async (req: Request, res: Response) => {
  try {
    await S3BucketService.upload(
      ConfigService.PublicBucket,
      req.params.category,
      req.body
    );
    res.status(200).send();
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
