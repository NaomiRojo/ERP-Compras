export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface IEmailService {
  send(input: SendEmailInput): Promise<void>;
}
