import { Request, Response } from "express";
import {
  AddWordOfTheDayRequest,
  AddWordOfTheDayResponse,
  ErrorResponse,
  WordOfTheDay,
} from "robrendellwebsite-common";
import { ConfigService } from "../services/config.service";
import { IPAddressService } from "../services/ip-address.service";
import S3BucketService from "../services/s3-bucket.service";

const wordOfDayFilename = "word-of-day.json";

export const AddWordOfDayEndpoint = async (req: Request, res: Response) => {
  try {
    if (IPAddressService.isOneOfMyIpAddresses(req)) {
      const wordOfTheDayToAdd: AddWordOfTheDayRequest = req.body;
      if (!wordOfTheDayToAdd.date) {
        return res.status(400).send(<ErrorResponse>{
          errorMessage: "'date' not given in request body",
        });
      }
      if (!wordOfTheDayToAdd.context) {
        return res.status(400).send(<ErrorResponse>{
          errorMessage: "'context' not given in request body",
        });
      }
      if (!wordOfTheDayToAdd.definition) {
        return res.status(400).send(<ErrorResponse>{
          errorMessage: "'definition' not given in request body",
        });
      }
      if (!wordOfTheDayToAdd.word) {
        return res.status(400).send(<ErrorResponse>{
          errorMessage: "'word' not given in request body",
        });
      }
      const wordOfDayJson = await S3BucketService.download(
        ConfigService.PublicBucket,
        wordOfDayFilename
      );
      let wordOfDay: WordOfTheDay[] = JSON.parse(
        wordOfDayJson?.toString() || ""
      );
      if (wordOfDay) {
        wordOfTheDayToAdd.word = wordOfTheDayToAdd.word.trim();
        wordOfDay = [wordOfDay[0], wordOfTheDayToAdd, ...wordOfDay.slice(1)];
      }
      await S3BucketService.upload(
        ConfigService.PublicBucket,
        wordOfDayFilename,
        JSON.stringify(wordOfDay)
      );
      res.status(200).send(<AddWordOfTheDayResponse>wordOfTheDayToAdd);
    } else {
      res.status(403).send(IPAddressService.blockedIpMessage);
    }
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
