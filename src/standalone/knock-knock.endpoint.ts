import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { IPAddressService } from "../services/ip-address.service";

export const KnockKnockEndpoint = async (req: Request, res: Response) => {
  try {
    if (AuthService.hasAccess(req)) {
      res.status(200).send();
    } else {
      console.log(`Forbidden: ${IPAddressService.getIPAddress(req)}`);
      res.status(403).send(IPAddressService.blockedIpMessage);
    }
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
};
