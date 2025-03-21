import { Request, Response } from "express";
import {
  AddDateInHistoryRequest,
  AddDateInHistoryResponse,
  ErrorResponse,
  InterestingDateInHistory,
} from "robrendellwebsite-common";
import { AuthService } from "../services/auth.service";
import { ConfigService } from "../services/config.service";
import { IPAddressService } from "../services/ip-address.service";
import S3BucketService from "../services/s3-bucket/s3-bucket.service";

const datesInHistoryFile = "dates-in-history.json";

export const AddDateInHistoryEndpoint = async (req: Request, res: Response) => {
  try {
    if (AuthService.hasAccess(req)) {
      const dateInHistoryToAdd: AddDateInHistoryRequest = req.body;
      if (!dateInHistoryToAdd.date) {
        return res.status(400).send(<ErrorResponse>{
          errorMessage: "'date' not given in request body",
        });
      }
      if (!dateInHistoryToAdd.event) {
        return res.status(400).send(<ErrorResponse>{
          errorMessage: "'event' not given in request body",
        });
      }
      if (!dateInHistoryToAdd.school) {
        return res.status(400).send(<ErrorResponse>{
          errorMessage: "'school' not given in request body",
        });
      }
      const datesInHistoryJson = await S3BucketService.download(
        ConfigService.PublicBucket,
        datesInHistoryFile
      );
      let datesInHistory: InterestingDateInHistory[] = JSON.parse(
        datesInHistoryJson?.toString() || ""
      );
      if (datesInHistory) {
        if (typeof dateInHistoryToAdd.insertionIndex !== "undefined") {
          datesInHistory.splice(
            dateInHistoryToAdd.insertionIndex,
            0,
            dateInHistoryToAdd
          );
        } else {
          datesInHistory = [dateInHistoryToAdd, ...datesInHistory];
        }
      }
      await S3BucketService.upload(
        ConfigService.PublicBucket,
        datesInHistoryFile,
        JSON.stringify(datesInHistory)
      );
      res.status(200).send(<AddDateInHistoryResponse>dateInHistoryToAdd);
    } else {
      res.status(403).send(IPAddressService.blockedIpMessage);
    }
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
