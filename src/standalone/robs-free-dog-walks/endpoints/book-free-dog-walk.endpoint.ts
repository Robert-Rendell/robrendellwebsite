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
    let s3Json = null;
    try {
      s3Json = await S3BucketService.download(
        ConfigService.PublicBucket,
        ROBS_FREE_DOG_WALKS_FOLDER_KEY + DOG_WALKING_CALENDAR_JSON
      );
    } catch (e) {
      console.log((e as Error).message);
      if ((e as Error).message === "The specified key does not exist.") {
        const newDogWalkingCalendar: DogWalkingCalendarJson = {
          lastUpdated: "22.03.25",
          bookingsRequested: [],
          bookingsConfirmed: [],
        };
        await S3BucketService.upload(
          ConfigService.PublicBucket,
          ROBS_FREE_DOG_WALKS_FOLDER_KEY + DOG_WALKING_CALENDAR_JSON,
          JSON.stringify(newDogWalkingCalendar)
        );
      } else {
        throw e;
      }
    }

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

    return res.status(200).send({
      index: dogWalkingCalendar.bookingsRequested.length,
      payload,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send((e as Error).message);
  }
};
