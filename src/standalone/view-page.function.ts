import { Request } from "express";
import {
  PageViewRequest,
  PageViewerDocument,
  ViewPageResponse,
} from "robrendellwebsite-common";
import { IPAddressService } from "../services/ip-address.service";
import { PageViewsDynamoDbService } from "../services/page-views-dynamodb.service";
import { doNotSaveIps } from "./utils/do-not-save-ip-list";

export const ViewPageFunc = async (
  req: Request<PageViewRequest>
): Promise<ViewPageResponse> => {
  const pageViewObj: PageViewRequest = req.body;
  if (!pageViewObj.pageUrl) {
    throw new Error("'pageUrl' not given in request body");
  }
  pageViewObj.ipAddress = `${IPAddressService.getIPAddress(req)}`;
  pageViewObj.dateTime = String(new Date());
  delete pageViewObj.headers;
  const isSaving = !doNotSaveIps().includes(pageViewObj.ipAddress);
  const pageViewDocument: PageViewerDocument =
    await PageViewsDynamoDbService.savePageView({
      pageViewer: pageViewObj,
      isSaving,
    });
  if (!isSaving) {
    console.log(
      "[SavePageView]:",
      pageViewObj.ipAddress,
      "that is me - not capturing page view"
    );
  }

  return {
    total: pageViewDocument.total,
    pageUrl: pageViewDocument.pageUrl,
  };
};
