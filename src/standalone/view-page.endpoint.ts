import { Request, Response } from "express";
import { ViewPageFunc } from "./view-page.function";

export const SavePageView = async (req: Request, res: Response) => {
  try {
    const pageViewDocument = await ViewPageFunc(req);
    res.status(200).send(pageViewDocument);
  } catch (e) {
    console.log(e);
    res.status(500).send((e as Error).message);
  }
};
