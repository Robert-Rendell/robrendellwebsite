import axios from "axios";
import { ConfigService } from "./config.service";

export interface EmailOptions {
  subject: string;
}

export interface EmailOptionsText extends EmailOptions {
  text: string;
}

export interface EmailOptionsHtml extends EmailOptions {
  html: string;
}

export class EmailService {
  public static async send(emailOptions: EmailOptionsText | EmailOptionsHtml) {
    try {
      await axios.post(ConfigService.EmailServiceUrl, emailOptions);
    } catch (e) {
      console.error(e);
    }
  }
}
