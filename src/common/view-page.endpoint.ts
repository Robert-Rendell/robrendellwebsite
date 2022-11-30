import { Request, Response } from "express";
import {
  PageViewDto,
  PageViewerDocument,
} from "../models/page-viewer-document";

import { IPAddressService } from "../services/ip-address.service";
import { PageViewsDynamoDbService } from "../services/page-views-dynamodb.service";
import { doNotSaveIps } from "./utils/do-not-save-ip-list";

export const SavePageView = async (req: Request, res: Response) => {
  try {
    const unsafeTypedRequest: PageViewDto = req.body;
    if (!unsafeTypedRequest.pageUrl) {
      throw new Error("PageUrl not given in request");
    }
    unsafeTypedRequest.ipAddress = `${IPAddressService.getIPAddress(req)}`;
    unsafeTypedRequest.dateTime = String(new Date());
    delete unsafeTypedRequest.headers;
    const isSaving = !doNotSaveIps().includes(unsafeTypedRequest.ipAddress);
    const pageViewDocument: PageViewerDocument =
      await PageViewsDynamoDbService.savePageView({
        pageViewer: unsafeTypedRequest,
        isSaving,
      });
    if (!isSaving) {
      console.log(
        "[SavePageView]:",
        unsafeTypedRequest.ipAddress,
        "that is me - not capturing page view"
      );
    }
    res.status(200).send(pageViewDocument);
  } catch (e) {
    console.log(e);
    res.status(500).send((e as Error).message);
  }
};
