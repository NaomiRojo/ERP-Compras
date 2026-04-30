import type {
  ITwoFactorPhoneService,
  SendTwoFactorPhoneCodeInput,
} from "src/application/interfaces/ITwoFactorPhoneService";

export interface TwilioTwoFactorPhoneServiceConfig {
  accountSid: string;
  authToken: string;
  fromPhone: string;
  whatsappContentSid?: string;
}

const WHATSAPP_PREFIX = "whatsapp:";
const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

export class TwilioTwoFactorPhoneService implements ITwoFactorPhoneService {
  private readonly authHeader: string;
  private readonly fromAddress: string;
  private readonly whatsappContentSid?: string;

  public constructor(private readonly config: TwilioTwoFactorPhoneServiceConfig) {
    this.authHeader = `Basic ${Buffer.from(
      `${config.accountSid}:${config.authToken}`,
    ).toString("base64")}`;
    this.fromAddress = this.normalizeFromAddress(config.fromPhone);
    this.whatsappContentSid = config.whatsappContentSid?.trim() || undefined;
  }

  public async sendCode(input: SendTwoFactorPhoneCodeInput): Promise<void> {
    if (input.channel === "SMS") {
      await this.sendSms(input.to, input.code);
      return;
    }

    if (input.channel === "WHATSAPP") {
      await this.sendWhatsAppMessage(input.to, input.code);
      return;
    }

    await this.sendVoiceCall(input.to, input.code);
  }

  private async sendSms(to: string, code: string): Promise<void> {
    if (this.isWhatsAppAddress(this.fromAddress)) {
      throw new Error(
        "TWILIO_FROM_PHONE esta configurado como remitente de WhatsApp. Usa twoFactorChannel=WHATSAPP o configura un numero SMS en formato E.164.",
      );
    }

    const endpoint = this.apiEndpoint("Messages.json");
    const body = new URLSearchParams({
      To: this.normalizeE164PhoneNumber(to, "El numero destino de SMS"),
      From: this.fromAddress,
      Body: `Tu codigo de segundo factor ERP es ${code}. Expira en 5 minutos.`,
    });

    await this.postForm(endpoint, body, "SMS");
  }

  private async sendWhatsAppMessage(to: string, code: string): Promise<void> {
    if (!this.isWhatsAppAddress(this.fromAddress)) {
      throw new Error(
        "TWILIO_FROM_PHONE debe usar el prefijo whatsapp: cuando twoFactorChannel=WHATSAPP.",
      );
    }

    const endpoint = this.apiEndpoint("Messages.json");
    const resolvedTo = this.resolveWhatsAppAddress(to);

    if (this.shouldSendWhatsAppTemplate(resolvedTo)) {
      const body = new URLSearchParams({
        To: resolvedTo,
        From: this.fromAddress,
        ContentSid: this.whatsappContentSid!,
        ContentVariables: JSON.stringify({
          1: "ERP",
          2: code,
        }),
      });

      await this.postForm(endpoint, body, "WhatsApp");
      return;
    }

    const body = new URLSearchParams({
      To: resolvedTo,
      From: this.fromAddress,
      Body: `Tu codigo de segundo factor ERP es ${code}. Expira en 5 minutos.`,
    });

    await this.postForm(endpoint, body, "WhatsApp");
  }

  private async sendVoiceCall(to: string, code: string): Promise<void> {
    if (this.isWhatsAppAddress(this.fromAddress)) {
      throw new Error(
        "TWILIO_FROM_PHONE esta configurado como remitente de WhatsApp y no sirve para llamadas de voz.",
      );
    }

    const endpoint = this.apiEndpoint("Calls.json");
    const body = new URLSearchParams({
      To: this.normalizeE164PhoneNumber(to, "El numero destino de llamada"),
      From: this.fromAddress,
      Twiml: `<Response><Say language="es-ES" voice="alice">Tu codigo de acceso ERP es ${code}. Repetimos. ${code}.</Say></Response>`,
    });

    await this.postForm(endpoint, body, "llamada");
  }

  private resolveWhatsAppAddress(to: string): string {
    const normalizedTo = to.trim();
    const phoneNumber = this.isWhatsAppAddress(normalizedTo)
      ? normalizedTo.slice(WHATSAPP_PREFIX.length)
      : normalizedTo;

    return `${WHATSAPP_PREFIX}${this.normalizeE164PhoneNumber(
      phoneNumber,
      "El numero destino de WhatsApp",
    )}`;
  }

  private shouldSendWhatsAppTemplate(to: string): boolean {
    return Boolean(
      this.whatsappContentSid &&
        this.isWhatsAppAddress(this.fromAddress) &&
        this.isWhatsAppAddress(to),
    );
  }

  private apiEndpoint(resource: string): string {
    return `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/${resource}`;
  }

  private normalizeFromAddress(fromPhone: string): string {
    const trimmed = fromPhone.trim();
    if (!trimmed) {
      throw new Error("TWILIO_FROM_PHONE es obligatorio");
    }

    if (!this.isWhatsAppAddress(trimmed)) {
      return trimmed;
    }

    return `${WHATSAPP_PREFIX}${this.normalizeE164PhoneNumber(
      trimmed.slice(WHATSAPP_PREFIX.length),
      "TWILIO_FROM_PHONE",
    )}`;
  }

  private isWhatsAppAddress(value: string): boolean {
    return value.trim().toLowerCase().startsWith(WHATSAPP_PREFIX);
  }

  private normalizeE164PhoneNumber(value: string, fieldLabel: string): string {
    const compactValue = value.trim().replace(/[\s()-]/g, "");

    if (!E164_PHONE_REGEX.test(compactValue)) {
      throw new Error(`${fieldLabel} debe estar en formato E.164, por ejemplo +59171234567.`);
    }

    return compactValue;
  }

  private async postForm(
    endpoint: string,
    body: URLSearchParams,
    channelLabel: string,
  ): Promise<void> {
    let response: Response;

    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          authorization: this.authHeader,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error de red desconocido";
      throw new Error(`No se pudo conectar con Twilio: ${message}`);
    }

    if (!response.ok) {
      const responseBody = await this.formatErrorResponse(response);
      throw new Error(
        `Twilio respondio ${response.status} al enviar ${channelLabel}: ${responseBody}`,
      );
    }
  }

  private async formatErrorResponse(response: Response): Promise<string> {
    const responseBody = (await response.text()).trim();
    if (!responseBody) {
      return "sin detalle";
    }

    try {
      const parsedBody = JSON.parse(responseBody) as {
        message?: unknown;
        code?: unknown;
      };

      if (typeof parsedBody.message === "string" && parsedBody.message.trim()) {
        if (typeof parsedBody.code === "number") {
          return `codigo ${parsedBody.code}: ${parsedBody.message.trim()}`;
        }

        return parsedBody.message.trim();
      }
    } catch {}

    return responseBody.slice(0, 200);
  }
}
