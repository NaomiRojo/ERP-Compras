export type TwoFactorPhoneChannel = "SMS" | "WHATSAPP" | "VOICE";

export interface SendTwoFactorPhoneCodeInput {
  channel: TwoFactorPhoneChannel;
  to: string;
  code: string;
}

export interface ITwoFactorPhoneService {
  sendCode(input: SendTwoFactorPhoneCodeInput): Promise<void>;
}
