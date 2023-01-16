import { Request, Response } from "express";
import { InterestingDateInHistory } from "robrendellwebsite-common";
import { ConfigService } from "../services/config.service";
import { IPAddressService } from "../services/ip-address.service";
import S3BucketService from "../services/s3-bucket.service";

const datesInHistoryFile = "dates-in-history.json";

export const AddDateInHistoryEndpoint = async (req: Request, res: Response) => {
  try {
    if (IPAddressService.isOneOfMyIpAddresses(req)) {
      const dateInHistoryToAdd: InterestingDateInHistory = req.body;
      if (!dateInHistoryToAdd.date) {
        throw new Error("'date' not given in request body");
      }
      if (!dateInHistoryToAdd.event) {
        throw new Error("'event' not given in request body");
      }
      if (!dateInHistoryToAdd.school) {
        throw new Error("'school' not given in request body");
      }
      const datesInHistoryJson = await S3BucketService.download(
        ConfigService.PublicBucket,
        datesInHistoryFile
      );
      let datesInHistory: InterestingDateInHistory[] = JSON.parse(
        datesInHistoryJson?.toString() || ""
      );
      if (datesInHistory) {
        datesInHistory = [dateInHistoryToAdd, ...datesInHistory];
      }
      await S3BucketService.upload(
        ConfigService.PublicBucket,
        datesInHistoryFile,
        JSON.stringify(datesInHistory)
      );
      res.status(200).send(dateInHistoryToAdd);
    } else {
      res.status(403).send(IPAddressService.blockedIpMessage);
    }
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
