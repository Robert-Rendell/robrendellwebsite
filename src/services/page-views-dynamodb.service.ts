import AWS from "aws-sdk";
import {
  PageView,
  PageViewDto,
  PageViewerDocument,
} from "../models/page-viewer-document";
import { ConfigService } from "./config.service";
import DynamoDBService from "./dynamo-db.service";

export class PageViewsDynamoDbService extends DynamoDBService {
  public static readonly PartitionKey = "pageUrl";

  public static async savePageView(
    pageViewer: PageViewDto
  ): Promise<PageViewerDocument> {
    const currentPage = (await PageViewsDynamoDbService.getPageView(
      pageViewer[PageViewsDynamoDbService.PartitionKey]
    )) ?? {
      pageUrl: pageViewer[PageViewsDynamoDbService.PartitionKey],
      views: [],
      total: 0,
    };

    currentPage.total += 1;
    const viewer: PageView = {
      dateTime: pageViewer.dateTime,
      ipAddress: pageViewer.ipAddress,
    };
    currentPage.views.push(viewer);
    console.log("currentPage:", currentPage);
    const marshalled = AWS.DynamoDB.Converter.marshall(currentPage);
    await super.save(ConfigService.PageViewsDynamoDbTable, marshalled);
    return currentPage;
  }

  public static async getPageView(
    key: string
  ): Promise<PageViewerDocument | undefined> {
    const attributeMap = await super.load(
      ConfigService.PageViewsDynamoDbTable,
      PageViewsDynamoDbService.PartitionKey,
      key
    );
    if (!attributeMap) return undefined;
    return AWS.DynamoDB.Converter.unmarshall(
      attributeMap
    ) as PageViewerDocument;
  }
}
