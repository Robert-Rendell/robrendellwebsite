import * as mailer from "nodemailer";
import { ConfigService } from "./config.service";

type Props = {
  from?: string;
  to?: string;
  subject: string;
  text: string;
};

export class EmailService {
  public static send(props: Props): Promise<boolean> {
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
      const opts = { ...props };
      if (!opts.from) opts.from = defaultOptions.from;
      if (!opts.to) opts.to = defaultOptions.to;
      transporter.sendMail(opts, (error) => {
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
