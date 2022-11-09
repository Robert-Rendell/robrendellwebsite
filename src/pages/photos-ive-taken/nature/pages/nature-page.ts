import { Request, Response } from 'express';
import { ConfigService } from '../../../../services/config.service';
import S3BucketService from '../../../../services/s3-bucket.service';
import { S3ImagePrefix } from '../../../../enums/s3-image-prefix.enum';
import { S3ImagePageResponse } from '../response/s3-image-page.response';

export const NaturePage = async (
  opts: {req: Request, res: Response, s3ImagePrefix: S3ImagePrefix },
) => {
  try {
    const bucket = ConfigService.PhotosIveTakenImageBucket;
    console.log('Getting s3 urls for:', bucket, opts.s3ImagePrefix);
    const s3ImageUrls = await S3BucketService.getDownloadLinks(bucket, opts.s3ImagePrefix);
    const responseBody: S3ImagePageResponse = { s3ImageUrls };
    opts.res.status(200).send(responseBody);
  } catch (e) {
    opts.res.status(500).send((e as Error).message);
  }
};
