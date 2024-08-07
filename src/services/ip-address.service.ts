/* eslint-disable camelcase */
import * as geoip from "fast-geoip";
import { IPLocation } from "robrendellwebsite-common";
import { Request } from "express";
import { ConfigService } from "./config.service";
import axios, { AxiosResponse } from "axios";

export class IPAddressService {
  /**
   * https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
   * If you are running behind a proxy like NGiNX or what have you, only then you should
   * check for 'x-forwarded-for':
   * var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
   * If the proxy isn't 'yours', I wouldn't trust the 'x-forwarded-for' header,
   * because it can be spoofed.
   */
  public static getIPAddress(req: Request<unknown>): string | string[] {
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

  public static async getVPNInformation(
    ipAddress: string
  ): Promise<VPNInformation | undefined> {
    try {
      const vpnInfo = await axios.get<unknown, AxiosResponse<VPNInformation>>(
        `https://vpnapi.io/api/${ipAddress}`,
        {
          params: {
            key: ConfigService.VPNInfoServiceAPIKey,
          },
        }
      );

      return vpnInfo.data;
    } catch (e) {
      console.error(e);
    }
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

// TODO - move below type into robrendellwebsite-common
interface VPNInformation {
  ip: string;
  security: Security;
  location: Location;
  network: Network;
}

interface Location {
  city: string;
  region: string;
  country: string;
  continent: string;
  region_code: string;
  country_code: string;
  continent_code: string;
  latitude: string;
  longitude: string;
  time_zone: string;
  locale_code: string;
  metro_code: string;
  is_in_european_union: boolean;
}

interface Network {
  network: string;
  autonomous_system_number: string;
  autonomous_system_organization: string;
}

interface Security {
  vpn: boolean;
  proxy: boolean;
  tor: boolean;
  relay: boolean;
}
