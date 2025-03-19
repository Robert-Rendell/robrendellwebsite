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
    const s3Json = await S3BucketService.download(
      ConfigService.PublicBucket,
      ROBS_FREE_DOG_WALKS_FOLDER_KEY + DOG_BREEDS_JSON
    );
    let dogBreedsJson: DogBreedsJson = JSON.parse(s3Json?.toString() || "");

    res.status(200).send(JSON.stringify(dogBreedsJson));
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
