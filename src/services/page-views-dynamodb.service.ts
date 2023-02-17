import AWS from "aws-sdk";
import {
  IPLocation,
  PageView,
  PageViewerDocument,
  PageViewRequest,
} from "robrendellwebsite-common";
import { doNotSaveIps } from "../standalone/utils/do-not-save-ip-list";
import { ConfigService } from "./config.service";
import DynamoDBService from "./dynamo-db.service";
import { IPAddressService } from "./ip-address.service";
import { EmailService } from "./email.service";

type SavePageViewProps = {
  pageViewer: PageViewRequest;
  isSaving: boolean;
};

export class PageViewsDynamoDbService extends DynamoDBService {
  public static readonly PartitionKey = "pageUrl";

  public static async savePageView(
    props: SavePageViewProps
  ): Promise<PageViewerDocument> {
    const { pageViewer, isSaving } = props;
    const pageUrl = pageViewer[PageViewsDynamoDbService.PartitionKey];
    const currentPage = (await PageViewsDynamoDbService.getPageView(
      pageUrl
    )) ?? {
      pageUrl,
      views: [],
      total: 0,
    };

    currentPage.views = currentPage.views.filter(
      (view) => !doNotSaveIps().includes(view.ipAddress)
    );
    if (isSaving) {
      const ipLocation: IPLocation | undefined =
        await IPAddressService.getIPLocation(
          pageViewer.ipAddress
        ).catch<undefined>((error) => {
          console.error("IPAddressService.getIPLocation", error);
          return undefined;
        });
      const uniquePageViews = new Set(
        currentPage.views.map((pageView) => pageView.ipAddress)
      );
      currentPage.total = uniquePageViews.size;
      const viewer: PageView = {
        dateTime: pageViewer.dateTime,
        ipLocation,
        ipAddress: pageViewer.ipAddress,
      };
      EmailService.send({
        subject: "[robrendellwebsite] Page view!",
        text: `${pageUrl} - ${pageViewer.ipAddress} - ${JSON.stringify(
          ipLocation,
          null,
          2
        )}`,
      });
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
