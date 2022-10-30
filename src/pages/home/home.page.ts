import { Request, Response } from 'express';
import { HomePageResponse, getImageFilename, HomePageOriginalImgsMap } from 'robrendellwebsite-common';
import ConfigService from '../../services/config.service';
import S3BucketService from '../../services/s3-bucket.service';
import { S3ImagePrefix } from '../../enums/s3-image-prefix.enum';

export const HomePage = async (req: Request, res: Response) => {
  try {
    const bucket = ConfigService.HomePageImageBucket;
    const thumbnailS3Urls = await S3BucketService.getDownloadLinks(bucket, S3ImagePrefix.Thumbnail);
    const originalImageS3Urls = await S3BucketService.getDownloadLinks(
      bucket, S3ImagePrefix.Original,
    );

    const originals: HomePageOriginalImgsMap = {};
    originalImageS3Urls.forEach((originalImageUrl: string) => {
      const imageFilename = getImageFilename(originalImageUrl);
      const mapping = thumbnailS3Urls.find(
        (thumbnailUrl: string) => thumbnailUrl.includes(imageFilename),
      );
      if (!mapping) throw Error(`No thumbnail image mapping for: ${imageFilename}`);
      originals[mapping] = originalImageUrl;
    });
    const response: HomePageResponse = {
      travelImages: thumbnailS3Urls || [],
      originals,
    };
    res.status(200).send(response);
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
