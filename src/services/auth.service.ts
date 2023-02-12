import { Request } from "express";
import { ConfigService } from "./config.service";
import { IPAddressService } from "./ip-address.service";

export class AuthService {
  public static hasAccess(req: Request): boolean {
    return (
      req.headers.authorization === ConfigService.KnockKnockSecurityKey &&
      IPAddressService.isOneOfMyIpAddresses(req)
    );
  }
}
