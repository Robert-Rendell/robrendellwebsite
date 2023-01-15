import { Request, Response } from "express";
import {
  OperationsDashboardRequest,
  OperationsDashboardResponse,
} from "robrendellwebsite-common";
import { PageViewsDynamoDbService } from "../services/page-views-dynamodb.service";

export const OperationsDashboardPage = async (req: Request, res: Response) => {
  try {
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
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
