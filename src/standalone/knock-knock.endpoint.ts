import { Request, Response } from "express";
import { IPAddressService } from "../services/ip-address.service";

export const KnockKnockEndpoint = async (req: Request, res: Response) => {
  try {
    if (IPAddressService.isOneOfMyIpAddresses(req)) {
      res.status(200).send();
    } else {
      res.status(403).send(IPAddressService.blockedIpMessage);
    }
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
