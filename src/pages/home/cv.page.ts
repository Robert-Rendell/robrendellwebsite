import { Request, Response } from "express";
import { ViewPageFunc } from "../../standalone/view-page.function";
import { resourcesPath } from "../../resources/path";
import { IPAddressService } from "../../services/ip-address.service";

export const CVPage = async (req: Request, res: Response) => {
  try {
    req.body.pageUrl = "/cv";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ViewPageFunc(req as any);
    const options = {
      root: resourcesPath,
    };

    console.log("path", resourcesPath);
    const fileName = "CV_Robert_Rendell.pdf";
    if (IPAddressService.isBlockedIpAddress(req)) {
      res.status(403).send(IPAddressService.blockedIpMessage);
    } else {
      res.sendFile(fileName, options, (err) => {
        if (err) {
          console.log(err.message);
          res.status(500).send(err.message);
        } else {
          console.log("Sent:", fileName);
        }
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send((e as Error).message);
  }
};
