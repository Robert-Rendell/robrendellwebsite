import { Request } from 'express';

class IPAddressService {
  /**
   * https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
   * If you are running behind a proxy like NGiNX or what have you, only then you should
   * check for 'x-forwarded-for':
   * var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
   * If the proxy isn't 'yours', I wouldn't trust the 'x-forwarded-for' header,
   * because it can be spoofed.
   */
  public static getIPAddress(req: Request): string | string[] {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown IP';
    console.log(ip);
    return ip;
  }
}

export { IPAddressService as default };
