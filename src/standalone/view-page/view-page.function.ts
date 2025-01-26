import { Request } from "express";
import { PageViewRequest } from "robrendellwebsite-common";
import { invokeCustomAnalyticsLambda } from "./invoke-custom-analytics";
import { IPAddressService } from "../../services/ip-address.service";

export const ViewPageFunc = async (req: Request<PageViewRequest>) => {
  const { pageUrl } = req.body;
  if (!pageUrl) {
    throw new Error("'pageUrl' not given in request body");
  }
  invokeCustomAnalyticsLambda({
    pageRoute: pageUrl,
    browserAgent: req.headers["user-agent"] as string,
    ipAddress: `${IPAddressService.getIPAddress(req)}`,
    dateTime: String(new Date()),
  });
};
