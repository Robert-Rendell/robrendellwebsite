import { Request, Response } from "express";
import { AuthService } from "../../services/auth.service";
import { ErrorResponse } from "robrendellwebsite-common";
import S3BucketService from "../../services/s3-bucket.service";
import { ConfigService } from "../../services/config.service";
import { IPAddressService } from "../../services/ip-address.service";
import { DOG_BREEDS_JSON, ROBS_FREE_DOG_WALKS_FOLDER_KEY } from "./const";
import { DogBreedsJson } from "./types/dog-breeds";

export const GetDogBreedsEndpoint = async (req: Request, res: Response) => {
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

      const s3Json = await S3BucketService.download(
        ConfigService.PublicBucket,
        ROBS_FREE_DOG_WALKS_FOLDER_KEY + DOG_BREEDS_JSON
      );
      let dogBreedsJson: DogBreedsJson = JSON.parse(s3Json?.toString() || "");

      res.status(200).send(JSON.stringify(dogBreedsJson));
    } else {
      res.status(403).send(IPAddressService.blockedIpMessage);
    }
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
