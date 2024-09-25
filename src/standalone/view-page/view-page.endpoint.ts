import { Request, Response } from "express";
import { PageViewRequest } from "robrendellwebsite-common";
import { ViewPageFunc } from "./view-page.function";

export const SavePageView = async (
  req: Request<PageViewRequest>,
  res: Response
) => {
  try {
    await ViewPageFunc(req);
    res.status(200).send({});
  } catch (e) {
    console.log(e);
    res.status(500).send((e as Error).message);
  }
};
