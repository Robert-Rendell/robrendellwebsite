import * as mailer from "nodemailer";

const email = "robrendellwebsite@hotmail.com";
const pass = "FplRqa23@!";
const defaultOptions = {
  from: email,
  to: "rob_452@hotmail.co.uk",
};

type Props = {
  from?: string;
  to?: string;
  subject: string;
  text: string;
};

export class EmailService {
  public static send(props: Props): Promise<boolean> {
    return new Promise((resolve) => {
      const transporter = mailer.createTransport({
        service: "Hotmail",
        auth: {
          user: email,
          pass,
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
