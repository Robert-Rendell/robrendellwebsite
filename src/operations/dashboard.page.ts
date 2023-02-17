import { Request, Response } from "express";
import {
  OperationsDashboardRequest,
  OperationsDashboardResponse,
} from "robrendellwebsite-common";
import { PageViewsDynamoDbService } from "../services/page-views-dynamodb.service";
import { AuthService } from "../services/auth.service";
import { IPAddressService } from "../services/ip-address.service";

export const OperationsDashboardPage = async (req: Request, res: Response) => {
  try {
    if (AuthService.hasAccess(req)) {
      const unsafeTypedRequest: OperationsDashboardRequest = req.body;
      if (!unsafeTypedRequest.pageUrls) {
        throw new Error("'pageUrls' not given in request body");
      }
      const pageViewPromises = unsafeTypedRequest.pageUrls.map((pageUrl) =>
        PageViewsDynamoDbService.getPageView(pageUrl)
      );
      const results = await Promise.all(pageViewPromises);
      const response: OperationsDashboardResponse = {
        pageViews: results,
      };
      res.status(200).send(response);
    } else {
      res.status(403).send(IPAddressService.blockedIpMessage);
    }
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
