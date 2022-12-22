/* eslint-disable camelcase */
import axios from "axios";
import { Request } from "express";
import { ConfigService } from "./config.service";

export type IPLocation = {
  host: string;
  ip: string;
  rdns: string;
  asn: string;
  country_name: string;
  country_code: string;
  region_name: string;
  region_code: string;
  city: string;
  postal_code: string;
  contitent_code: string;
  latitude: string;
  longitude: string;
  metro_code: string;
  timezone: string;
  datetime: string;

  // Newcastle upon Tyne
  // Newcastle upon Tyne (NET)
  // NE3
  // United Kingdom (GB)
  // Europe (EU)
  // 55.0021 (lat) / -1.6287 (long)
  // 2022-11-30 06:07:07 (Europe/London)
  // NETWORK
  // eslint-disable-next-line camelcase
  // 86.8.53.70
  // cpc1-benw13-2-0-cust325.16-2.cable.virginm.net
  // Virgin Media Limited
  // 5089
};

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

  public static async getIPLocation(ipAddress: string): Promise<IPLocation> {
    const result = await axios.get(
      `https://tools.keycdn.com/geo.json?host=${ipAddress}`,
      {
        headers: {
          "User-Agent": `keycdn-tools:${ConfigService.ApiHost}`,
        },
      }
    );
    console.log(
      `IPAddressService.getIPLocation(${ipAddress})`,
      result.status,
      result.data
    );
    return result.data;
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
    return "Nope! I've taken the right to access this file away from you personally. I'm not sorry about it either.";
  }
}
