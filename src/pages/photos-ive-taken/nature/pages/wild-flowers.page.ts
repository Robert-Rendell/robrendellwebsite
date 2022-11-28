// photos-ive-taken/nature/wild-flowers

import { Request, Response } from "express";
import { S3ImagePrefix } from "../../../../enums/s3-image-prefix.enum";
import { NaturePage } from "./nature-page";

export const WildFlowersPage = async (req: Request, res: Response) =>
  NaturePage({ req, res, s3ImagePrefix: S3ImagePrefix.WildFlowers });
