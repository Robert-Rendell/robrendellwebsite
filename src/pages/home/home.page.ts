import { Request, Response } from 'express';
import ConfigService from '../../services/config.service';
import S3BucketService from '../../services/s3-bucket.service';
import { S3ImagePrefix } from '../../enums/s3-image-prefix.enum';
import { HomePageResponse } from './response/home-page.response';

const getImageFilename = (s3ImageUrl: string) => s3ImageUrl.split('?')[0].split('/').slice(-1)[0];

export const HomePage = async (req: Request, res: Response) => {
  try {
    const bucket = ConfigService.HomePageImageBucket;
    const thumbnailS3Urls = await S3BucketService.getDownloadLinks(bucket, S3ImagePrefix.Thumbnail);
    const originalImageS3Urls = await S3BucketService.getDownloadLinks(
      bucket, S3ImagePrefix.Original,
    );

    const response: HomePageResponse = {
      travelImages: thumbnailS3Urls || [],
      originals: {
        ...originalImageS3Urls.map((originalImageUrl: string) => {
          const imageFilename = getImageFilename(originalImageUrl);
          const mapping = thumbnailS3Urls.find(
            (thumbnailUrl: string) => thumbnailUrl.includes(imageFilename),
          );
          if (!mapping) throw Error(`No thumbnail image mapping for: ${imageFilename}`);
          return { [mapping]: originalImageUrl };
        }),
      },
    };
    res.status(200).send(response);
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
