import { Request } from "express";
import { PageViewRequest } from "robrendellwebsite-common";
import { invokeCustomAnalyticsLambda } from "./invoke-custom-analytics";

export const ViewPageFunc = async (req: Request<PageViewRequest>) => {
  const pageViewObj: PageViewRequest = req.body;
  if (!pageViewObj.pageUrl) {
    throw new Error("'pageUrl' not given in request body");
  }
  invokeCustomAnalyticsLambda({
    pageRoute: pageViewObj.pageUrl,
    browserAgent: req.headers["user-agent"] as string,
    ipAddress: pageViewObj.ipAddress,
    dateTime: pageViewObj.dateTime,
  });
  return;
};
