import AWS from "aws-sdk";
import { PageViewerDocument } from "robrendellwebsite-common";
import { ConfigService } from "./config.service";
import DynamoDBService from "./dynamo-db.service";

export class PageViewsDynamoDbService extends DynamoDBService {
  public static readonly PartitionKey = "pageUrl";

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
