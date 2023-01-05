import { Request } from "express";
import {
  PageViewDto,
  PageViewerDocument,
} from "../models/page-viewer-document";
import { IPAddressService } from "../services/ip-address.service";
import { PageViewsDynamoDbService } from "../services/page-views-dynamodb.service";
import { doNotSaveIps } from "./utils/do-not-save-ip-list";

export const ViewPageFunc = async (req: Request) => {
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
  return pageViewDocument;
};
