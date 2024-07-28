import * as mailer from "nodemailer";
import { ConfigService } from "./config.service";

export type EmailOptions = {
  from?: string;
  to?: string;
  subject: string;
  text: string;
};

export class EmailService {
  public static send(emailOptions: EmailOptions): Promise<boolean> {
    const defaultOptions = {
      from: ConfigService.EmailServiceEmail,
      to: ConfigService.EmailServiceEmailTarget,
    };
    return new Promise((resolve) => {
      const transporter = mailer.createTransport({
        service: "Hotmail",
        auth: {
          user: ConfigService.EmailServiceEmail,
          pass: ConfigService.EmailServicePass,
        },
      });
      const mailOptions = { ...emailOptions };
      if (!mailOptions.from) mailOptions.from = defaultOptions.from;
      if (!mailOptions.to) mailOptions.to = defaultOptions.to;
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error(error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
