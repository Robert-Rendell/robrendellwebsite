import axios from "axios";
import { ConfigService } from "./config.service";

export type EmailOptions = {
  subject: string;
  text: string;
};

export class EmailService {
  public static async send(emailOptions: EmailOptions) {
    try {
      await axios.post(ConfigService.EmailServiceUrl, emailOptions);
    } catch (e) {
      console.error(e);
    }
  }
}
