import { Request, Response } from "express";
import { PageViewDto } from "../models/page-viewer-document";
import { ConfigService } from "../services/config.service";
import { IPAddressService } from "../services/ip-address.service";
import { PageViewsDynamoDbService } from "../services/page-views-dynamodb.service";

const localIp = "::1";

export const SavePageView = async (req: Request, res: Response) => {
  try {
    const unsafeTypedRequest: PageViewDto = req.body;
    if (!unsafeTypedRequest.pageUrl) {
      throw new Error("PageUrl not given in request");
    }
    unsafeTypedRequest.ipAddress = `${IPAddressService.getIPAddress(req)}`;
    unsafeTypedRequest.dateTime = String(new Date());
    delete unsafeTypedRequest.headers;
    if (
      unsafeTypedRequest.ipAddress !== localIp ||
      unsafeTypedRequest.ipAddress !== ConfigService.MyPublicIpAddress
    ) {
      await PageViewsDynamoDbService.savePageView(unsafeTypedRequest);
    } else {
      console.log("[SavePageView]:", unsafeTypedRequest.ipAddress, "that is me - not capturing page view");
    }
    res.status(200).send({});
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
