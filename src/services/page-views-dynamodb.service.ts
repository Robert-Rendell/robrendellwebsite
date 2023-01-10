import AWS from "aws-sdk";
import { doNotSaveIps } from "../standalone/utils/do-not-save-ip-list";
import {
  PageView,
  PageViewDto,
  PageViewerDocument,
} from "../models/page-viewer-document";
import { ConfigService } from "./config.service";
import DynamoDBService from "./dynamo-db.service";
import { IPAddressService, IPLocation } from "./ip-address.service";

type SavePageViewProps = {
  pageViewer: PageViewDto;
  isSaving: boolean;
};

export class PageViewsDynamoDbService extends DynamoDBService {
  public static readonly PartitionKey = "pageUrl";

  public static async savePageView(
    props: SavePageViewProps
  ): Promise<PageViewerDocument> {
    const { pageViewer, isSaving } = props;
    const currentPage = (await PageViewsDynamoDbService.getPageView(
      pageViewer[PageViewsDynamoDbService.PartitionKey]
    )) ?? {
      pageUrl: pageViewer[PageViewsDynamoDbService.PartitionKey],
      views: [],
      total: 0,
    };

    currentPage.views = currentPage.views.filter(
      (view) => !doNotSaveIps().includes(view.ipAddress)
    );
    if (isSaving) {
      // const location: IPLocation =
      await IPAddressService.getIPLocation(pageViewer.ipAddress).catch(
        (error) => console.error("IPAddressService.getIPLocation", error)
      );
      const uniquePageViews = new Set(
        currentPage.views.map((pageView) => pageView.ipAddress)
      );
      currentPage.total = uniquePageViews.size;
      const viewer: PageView = {
        dateTime: pageViewer.dateTime,
        ipAddress: pageViewer.ipAddress,
      };
      currentPage.views.push(viewer);
      const marshalled = AWS.DynamoDB.Converter.marshall(currentPage);
      await super.save(ConfigService.PageViewsDynamoDbTable, marshalled);
    }

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
