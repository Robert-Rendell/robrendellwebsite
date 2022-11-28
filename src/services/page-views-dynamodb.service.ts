import AWS from "aws-sdk";
import { PageViewerDocument } from "../models/page-viewer-document";
import { ConfigService } from "./config.service";
import DynamoDBService from "./dynamo-db.service";

export class PageViewsDynamoDbService extends DynamoDBService {
  private static PartitionKey = "pageUrl";

  public static async savePageView(
    pageViewer: PageViewerDocument,
  ): Promise<void> {
    const currentPage = PageViewsDynamoDbService.getPageView(
      pageViewer[PageViewsDynamoDbService.PartitionKey],
    );
    console.log("currentPage:", currentPage);
    const marshalled = AWS.DynamoDB.Converter.marshall(pageViewer);
    await super.save(ConfigService.PageViewsDynamoDbTable, marshalled);
  }

  public static async getPageView(
    key: string,
  ): Promise<PageViewerDocument | undefined> {
    const attributeMap = await super.load(
      ConfigService.SudokuSubmissionsDynamoDbTable,
      PageViewsDynamoDbService.PartitionKey,
      key,
    );
    if (!attributeMap) return undefined;
    return AWS.DynamoDB.Converter.unmarshall(
      attributeMap,
    ) as PageViewerDocument;
  }
}
