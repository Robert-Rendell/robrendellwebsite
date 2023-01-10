import { PageViewerDocument } from "../../models/page-viewer-document";

export type OperationsDashboardResponse = {
  pageViews: (PageViewerDocument | undefined)[];
};
