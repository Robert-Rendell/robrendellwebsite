import { ConfigService } from "./config.service";
import axios from "axios";

export type EmailOptions = {
  subject: string;
  text: string;
};

export class EmailService {
  public static async send(emailOptions: EmailOptions) {
    try {
      await axios.post(ConfigService.EmailServiceUrl, {
        params: emailOptions,
      });
    } catch (e) {
      console.error(e);
    }
  }
}
