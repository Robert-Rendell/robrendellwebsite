export type PageUrl = string;

export type PageView = {
  ipAddress: string;
  dateTime: string;
};

export type PageViewDto = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers: any;
  pageUrl: PageUrl;
} & PageView;

export type PageViewerDocument = {
  pageUrl: PageUrl;
  views: PageView[];
  total: number;
};
