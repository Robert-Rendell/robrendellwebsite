/* eslint-disable camelcase */
import * as geoip from "fast-geoip";
import { Request } from "express";
import { ConfigService } from "./config.service";
import { IPLocation } from "../models/ip-location";

export class IPAddressService {
  /**
   * https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
   * If you are running behind a proxy like NGiNX or what have you, only then you should
   * check for 'x-forwarded-for':
   * var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
   * If the proxy isn't 'yours', I wouldn't trust the 'x-forwarded-for' header,
   * because it can be spoofed.
   */
  public static getIPAddress(req: Request): string | string[] {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "unknown IP";
    return ip;
  }

  public static async getIPLocation(
    ipAddress: string
  ): Promise<IPLocation | undefined> {
    const geo = await geoip.lookup(ipAddress);
    console.log(`IPAddressService.getIPLocation(${ipAddress})`, geo);
    return geo ?? undefined;
  }

  public static isOneOfMyIpAddresses(req: Request): boolean {
    const requestIpAddresses = IPAddressService.getIPAddress(req);
    const myIps = ConfigService.MyPublicIpAddress.split(",");
    if (typeof requestIpAddresses === "string") {
      return myIps.includes(requestIpAddresses);
    }
    myIps.forEach((myIp) => {
      requestIpAddresses.forEach((requestIp) => {
        if (requestIp === myIp) {
          return true;
        }
      });
    });
    return false;
  }

  public static isBlockedIpAddress(req: Request): boolean {
    const ipAddress = IPAddressService.getIPAddress(req);
    const blockedIps = ConfigService.BlockedIpAddresses;
    if (typeof ipAddress === "string") {
      return blockedIps.includes(ipAddress);
    }
    let blocked = false;
    ipAddress.forEach((ip) => {
      if (blockedIps.includes(ip)) {
        blocked = true;
      }
    });
    return blocked;
  }

  public static get blockedIpMessage(): string {
    return "Sorry, you don't have access to this :'(";
  }
}
