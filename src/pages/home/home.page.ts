import { Request, Response } from "express";
import { HomePageResponse } from "robrendellwebsite-common";
import { ConfigService } from "../../services/config.service";
import S3BucketService from "../../services/s3-bucket.service";
import { S3ImagePrefix } from "../../enums/s3-image-prefix.enum";

export const HomePage = async (req: Request, res: Response) => {
  try {
    const bucket = ConfigService.HomePageImageBucket;
    const travelImageS3Urls = await S3BucketService.getDownloadLinks(
      bucket,
      S3ImagePrefix.Thumbnail
    );
    const originalTravelImageS3Urls = await S3BucketService.getDownloadLinks(
      bucket,
      S3ImagePrefix.Original
    );
    const response: HomePageResponse = {
      travelImages: travelImageS3Urls || [],
      originalTravelImages: originalTravelImageS3Urls || [],
    };
    res.status(200).send(response);
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
