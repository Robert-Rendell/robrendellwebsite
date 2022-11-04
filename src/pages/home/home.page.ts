import { Request, Response } from 'express';
import { ConfigService } from '../../services/config.service';
import S3BucketService from '../../services/s3-bucket.service';
import { S3ImagePrefix } from '../../enums/s3-image-prefix.enum';
import HomePageResponse from './response/home-page.response';

export const HomePage = async (req: Request, res: Response) => {
  try {
    const bucket = ConfigService.HomePageImageBucket;
    const imageS3Urls = await S3BucketService.getDownloadLinks(bucket, S3ImagePrefix.Thumbnail);
    const response: HomePageResponse = {
      travelImages: imageS3Urls || [],
    };
    res.status(200).send(response);
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
