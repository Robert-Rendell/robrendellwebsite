import { Request, Response } from "express";
import { ErrorResponse } from "robrendellwebsite-common";
import S3BucketService from "../../services/s3-bucket/s3-bucket.service";
import { ConfigService } from "../../services/config.service";
import { AVAILABLE_WALKING_SLOTS_JSON_FILENAME } from "./const";

export const BookWalkingSlotsEndpoint = async (req: Request, res: Response) => {
  try {
    const payload: any = req.body;
    if (!payload.date) {
      return res.status(400).send(<ErrorResponse>{
        errorMessage: "'date' not given in request body",
      });
    }
    if (!payload.event) {
      return res.status(400).send(<ErrorResponse>{
        errorMessage: "'event' not given in request body",
      });
    }
    if (!payload.school) {
      return res.status(400).send(<ErrorResponse>{
        errorMessage: "'school' not given in request body",
      });
    }
    const s3Json = await S3BucketService.download(
      ConfigService.PublicBucket,
      AVAILABLE_WALKING_SLOTS_JSON_FILENAME
    );
    const availableWalkingSlots: any[] = JSON.parse(s3Json?.toString() || "");

    // Code
    // Goes
    // Here

    res.status(200).send(JSON.stringify(availableWalkingSlots));
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
