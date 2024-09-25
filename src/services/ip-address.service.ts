import { IPLocation } from "robrendellwebsite-common";
import { Request } from "express";
import { ConfigService } from "./config.service";

export class IPAddressService {
  public static getIPAddress(req: Request<unknown>): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (Array.isArray(forwarded)) {
      return forwarded[0];
    }
    const split = forwarded?.split(",");
    if (split && split.length > 1) {
      return split[0];
    }
    const ip = forwarded || req.socket.remoteAddress || "unknown IP";
    return ip;
  }

  public static isOneOfMyIpAddresses(req: Request): boolean {
    const requestIpAddresses = IPAddressService.getIPAddress(req);
    const myIps = ConfigService.MyPublicIpAddress.split(",");
    if (typeof requestIpAddresses === "string") {
      return myIps.includes(requestIpAddresses);
    }
    return false;
  }

  public static isBlockedIpAddress(req: Request): boolean {
    const ipAddress = IPAddressService.getIPAddress(req);
    const blockedIps = ConfigService.BlockedIpAddresses;
    if (typeof ipAddress === "string") {
      return blockedIps.includes(ipAddress);
    }
    let blocked = false;
    return blocked;
  }

  public static get blockedIpMessage(): string {
    return "Sorry, you don't have access to this :'(";
  }
}
