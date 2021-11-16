import { Request, Response } from 'express';
import ConfigService from '../../services/config.service';
import S3BucketService from '../../services/s3-bucket.service';
import S3ImagePrefix from './enums/s3-image-prefix.enum';
import HomePageResponse from './response/home-page.response';

const homepage = async (req: Request, res: Response) => {
  try {
    const s3BucketService = new S3BucketService();
    const bucket = ConfigService.HomePageImageBucket;
    const imageS3Urls = await s3BucketService.getDownloadLinks(bucket, S3ImagePrefix.Thumbnail);
    const response: HomePageResponse = {
      travelImages: imageS3Urls || [],
    };
    res.status(200).send(response);
  } catch (e) {
    res.status(500).send((e as any).message);
  }
};

export { homepage as default };
