import { Request, Response } from "express";
import { PageViewDto } from "../models/page-viewer-document";
import { IPAddressService } from "../services/ip-address.service";
import { PageViewsDynamoDbService } from "../services/page-views-dynamodb.service";

export const SavePageView = async (req: Request, res: Response) => {
  try {
    const unsafeTypedRequest: PageViewDto = req.body;
    if (!unsafeTypedRequest.pageUrl) {
      throw new Error("PageUrl not given in request");
    }
    unsafeTypedRequest.ipAddress = `${IPAddressService.getIPAddress(req)}`;
    unsafeTypedRequest.dateTime = String(new Date());
    delete unsafeTypedRequest.headers;
    await PageViewsDynamoDbService.savePageView(unsafeTypedRequest);
    res.status(200).send({});
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
