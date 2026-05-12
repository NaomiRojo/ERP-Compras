import { afterEach, describe, expect, test } from "bun:test";
import { TwilioTwoFactorPhoneService } from "./TwilioTwoFactorPhoneService";

const originalFetch = globalThis.fetch;
type CapturedRequest = { input: string; init?: RequestInit };

const createFetchSpy = (capturedRequest: { current: CapturedRequest | null }): typeof fetch =>
  (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    capturedRequest.current = {
      input: String(input),
      init,
    };

    return new Response("", { status: 201 });
  }) as unknown as typeof fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("TwilioTwoFactorPhoneService", () => {
  test("envia el codigo por WhatsApp cuando el canal es WHATSAPP", async () => {
    const capturedRequest: { current: CapturedRequest | null } = { current: null };
    globalThis.fetch = createFetchSpy(capturedRequest);

    const service = new TwilioTwoFactorPhoneService({
      accountSid: "AC1234567890",
      authToken: "secret-token",
      fromPhone: "whatsapp:+14155238886",
    });

    await service.sendCode({
      channel: "WHATSAPP",
      to: "+59170000001",
      code: "123456",
    });

    if (!capturedRequest.current) {
      throw new Error("No se capturo la solicitud a Twilio");
    }

    expect(capturedRequest.current.input).toBe(
      "https://api.twilio.com/2010-04-01/Accounts/AC1234567890/Messages.json",
    );

    const body = new URLSearchParams(String(capturedRequest.current.init?.body ?? ""));
    expect(body.get("From")).toBe("whatsapp:+14155238886");
    expect(body.get("To")).toBe("whatsapp:+59170000001");
    expect(body.get("Body")).toContain("123456");
  });

  test("usa el codigo como primera variable de plantilla de WhatsApp", async () => {
    const capturedRequest: { current: CapturedRequest | null } = { current: null };
    globalThis.fetch = createFetchSpy(capturedRequest);

    const service = new TwilioTwoFactorPhoneService({
      accountSid: "AC123",
      authToken: "token",
      fromPhone: "whatsapp:+14155238886",
      whatsappContentSid: "HXVERIFY",
    });

    await service.sendCode({
      channel: "WHATSAPP",
      to: "+59170059346",
      code: "123456",
    });

    if (!capturedRequest.current) {
      throw new Error("No se capturo la solicitud a Twilio");
    }

    const body = new URLSearchParams(String(capturedRequest.current.init?.body ?? ""));
    expect(body.get("To")).toBe("whatsapp:+59170059346");
    expect(body.get("From")).toBe("whatsapp:+14155238886");
    expect(body.get("ContentSid")).toBe("HXVERIFY");
    expect(body.get("ContentVariables")).toBe(JSON.stringify({ 1: "123456" }));
    expect(body.get("Body")).toBeNull();
  });

  test("normaliza el prefijo de WhatsApp y el numero destino a formato canonico", async () => {
    const capturedRequest: { current: CapturedRequest | null } = { current: null };
    globalThis.fetch = createFetchSpy(capturedRequest);

    const service = new TwilioTwoFactorPhoneService({
      accountSid: "AC1234567890",
      authToken: "secret-token",
      fromPhone: " WHATSAPP:+14155238886 ",
    });

    await service.sendCode({
      channel: "WHATSAPP",
      to: " whatsapp: +591 7000 0001 ",
      code: "123456",
    });

    if (!capturedRequest.current) {
      throw new Error("No se capturo la solicitud a Twilio");
    }

    const body = new URLSearchParams(String(capturedRequest.current.init?.body ?? ""));
    expect(body.get("From")).toBe("whatsapp:+14155238886");
    expect(body.get("To")).toBe("whatsapp:+59170000001");
  });

  test("falla si el numero destino de WhatsApp no esta en formato E.164", async () => {
    const service = new TwilioTwoFactorPhoneService({
      accountSid: "AC1234567890",
      authToken: "secret-token",
      fromPhone: "whatsapp:+14155238886",
    });

    await expect(
      service.sendCode({
        channel: "WHATSAPP",
        to: "70000001",
        code: "123456",
      }),
    ).rejects.toThrow(
      "El numero destino de WhatsApp debe estar en formato E.164, por ejemplo +59171234567.",
    );
  });

  test("falla si se intenta usar SMS con un remitente de WhatsApp", async () => {
    const service = new TwilioTwoFactorPhoneService({
      accountSid: "AC1234567890",
      authToken: "secret-token",
      fromPhone: "whatsapp:+14155238886",
    });

    await expect(
      service.sendCode({
        channel: "SMS",
        to: "+59170000001",
        code: "123456",
      }),
    ).rejects.toThrow(
      "TWILIO_FROM_PHONE esta configurado como remitente de WhatsApp. Usa twoFactorChannel=WHATSAPP o configura un numero SMS en formato E.164.",
    );
  });

  test("mantiene Body libre para SMS cuando no es WhatsApp", async () => {
    const capturedRequest: { current: CapturedRequest | null } = { current: null };
    globalThis.fetch = createFetchSpy(capturedRequest);

    const service = new TwilioTwoFactorPhoneService({
      accountSid: "AC123",
      authToken: "token",
      fromPhone: "+15005550006",
    });

    await service.sendCode({
      channel: "SMS",
      to: "+59170059346",
      code: "654321",
    });

    if (!capturedRequest.current) {
      throw new Error("No se capturo la solicitud a Twilio");
    }

    const body = new URLSearchParams(String(capturedRequest.current.init?.body ?? ""));
    expect(body.get("To")).toBe("+59170059346");
    expect(body.get("From")).toBe("+15005550006");
    expect(body.get("Body")).toContain("654321");
    expect(body.get("ContentSid")).toBeNull();
  });

  test("extrae el mensaje principal cuando Twilio devuelve un error JSON", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ code: 63015, message: "Sandbox user has not joined" }), {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      })) as unknown as typeof fetch;

    const service = new TwilioTwoFactorPhoneService({
      accountSid: "AC1234567890",
      authToken: "secret-token",
      fromPhone: "whatsapp:+14155238886",
    });

    await expect(
      service.sendCode({
        channel: "WHATSAPP",
        to: "+59170000001",
        code: "123456",
      }),
    ).rejects.toThrow(
      "Twilio respondio 400 al enviar WhatsApp: codigo 63015: Sandbox user has not joined",
    );
  });
});
