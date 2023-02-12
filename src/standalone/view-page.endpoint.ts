import { Request, Response } from "express";
import { PageViewDto, PageViewerDocument } from "robrendellwebsite-common";
import { ViewPageFunc } from "./view-page.function";

export const SavePageView = async (
  req: Request<PageViewDto>,
  res: Response
) => {
  try {
    const pageViewDocument: PageViewerDocument = await ViewPageFunc(req);
    res.status(200).send(pageViewDocument);
  } catch (e) {
    console.log(e);
    res.status(500).send((e as Error).message);
  }
};
