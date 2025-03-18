import { Request, Response } from "express";
import { AuthService } from "../../services/auth.service";
import { ErrorResponse } from "robrendellwebsite-common";
import S3BucketService from "../../services/s3-bucket.service";
import { ConfigService } from "../../services/config.service";
import { IPAddressService } from "../../services/ip-address.service";
import { AVAILABLE_WALKING_SLOTS_JSON_FILENAME } from "./const";

export const GetAvailableWalkingSlotsEndpoint = async (
  req: Request,
  res: Response
) => {
  // Reset s3 file lock if older than 20 minutes
  try {
    if (AuthService.hasAccess(req)) {
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

      // Take s3 file lock
      const s3Json = await S3BucketService.download(
        ConfigService.PublicBucket,
        AVAILABLE_WALKING_SLOTS_JSON_FILENAME
      );
      let availableWalkingSlots: any[] = JSON.parse(s3Json?.toString() || "");

      // Code
      // Goes
      // Here

      res.status(200).send(JSON.stringify(availableWalkingSlots));

      // Release s3 file lock
    } else {
      res.status(403).send(IPAddressService.blockedIpMessage);
    }
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
