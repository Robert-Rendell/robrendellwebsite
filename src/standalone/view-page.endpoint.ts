import { Request, Response } from "express";
import { PageViewRequest, ViewPageResponse } from "robrendellwebsite-common";
import { ViewPageFunc } from "./view-page.function";

export const SavePageView = async (
  req: Request<PageViewRequest>,
  res: Response
) => {
  try {
    const response: ViewPageResponse = await ViewPageFunc(req);
    res.status(200).send(response);
  } catch (e) {
    console.log(e);
    res.status(500).send((e as Error).message);
  }
};
