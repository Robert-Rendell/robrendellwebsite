import { Request, Response } from "express";
import { ViewPageFunc } from "../../common/view-page.function";
import { resourcesPath } from "../../resources/path";

export const CVPage = async (req: Request, res: Response) => {
  try {
    req.body.pageUrl = "/cv";
    await ViewPageFunc(req);
    const options = {
      root: resourcesPath
    };

    console.log("path", resourcesPath);
    const fileName = "CV_Robert_Rendell.pdf";
    res.sendFile(fileName, options, (err) => {
      if (err) {
        console.log(err.message);
        res.status(500).send(err.message);
      } else {
        console.log("Sent:", fileName);
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).send((e as Error).message);
  }
};
