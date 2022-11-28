export type PageView = {
  ipAddress: string;
  dateTime: string;
};

export type PageViewDto = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers: any;
  pageUrl: string;
} & PageView;

export type PageViewerDocument = {
  pageUrl: string;
  views: PageView[];
  total: number;
};
