import nodemailer from "nodemailer";
import type { IEmailService, SendEmailInput } from "src/application/interfaces/IEmailService";

export interface SmtpEmailServiceConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  tlsRejectUnauthorized: boolean;
}

export class SmtpEmailService implements IEmailService {
  private readonly transporter;

  public constructor(private readonly config: SmtpEmailServiceConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: config.tlsRejectUnauthorized,
      },
    });
  }

  public async send(input: SendEmailInput): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }
}
