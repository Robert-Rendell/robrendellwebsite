import { Request, Response } from "express";
import { ErrorResponse } from "robrendellwebsite-common";
import S3BucketService from "../../../services/s3-bucket/s3-bucket.service";
import { ConfigService } from "../../../services/config.service";
import {
  DOG_WALKING_CALENDAR_JSON,
  ROBS_FREE_DOG_WALKS_FOLDER_KEY,
} from "../const";
import { BookDogWalkingPayload } from "../types/payloads/book-dog-walking.payload";
import { DogWalkingCalendarJson } from "../types/jsons/dog-walking-calendar-json";
import { EmailService } from "../../../services/email.service";

type RequiredFields = (keyof BookDogWalkingPayload)[];

const requiredFields: RequiredFields = [
  "owner",
  "email",
  "dog",
  "dogBreed",
  "message",
  "dogWalkDatetime",
  "location",
  "phoneNumber",
];

export const BookFreeDogWalkEndpoint = async (req: Request, res: Response) => {
  try {
    const payload: BookDogWalkingPayload = req.body;
    const missingRequiredFields = [];
    for (const field of requiredFields) {
      if (!payload[field]) {
        missingRequiredFields.push(payload[field]);
      }
    }
    if (missingRequiredFields.length > 0) {
      return res.status(400).send(<ErrorResponse>{
        errorMessage: `'Missing required fields in request body: ${missingRequiredFields.join(
          ", "
        )}`,
      });
    }
    const s3Json = await S3BucketService.download(
      ConfigService.PublicBucket,
      ROBS_FREE_DOG_WALKS_FOLDER_KEY + DOG_WALKING_CALENDAR_JSON
    );
    const dogWalkingCalendar: DogWalkingCalendarJson = JSON.parse(
      s3Json?.toString() || ""
    );

    dogWalkingCalendar.bookingsRequested.push({
      ...payload,
      requestedBookingDatetime: "",
    });

    S3BucketService.upload(
      ConfigService.PublicBucket,
      ROBS_FREE_DOG_WALKS_FOLDER_KEY + DOG_WALKING_CALENDAR_JSON,
      JSON.stringify(dogWalkingCalendar)
    );

    EmailService.send({
      subject: `[robs-free-dog-walks] Requested walk: ${payload.owner} (${payload.dog})`,
      html: JSON.stringify(payload, null, 2),
    });

    res.status(200).send();
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
