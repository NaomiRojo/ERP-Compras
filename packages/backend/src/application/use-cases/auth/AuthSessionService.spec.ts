import { describe, expect, test } from "bun:test";
import type { IEmailService } from "src/application/interfaces/IEmailService";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import type { ITwoFactorPhoneService } from "src/application/interfaces/ITwoFactorPhoneService";
import { CodigoSegundoFactor } from "src/domain/entities/CodigoSegundoFactor";
import { Usuario } from "src/domain/entities/Usuario";
import type { RefreshTokenSesion } from "src/domain/entities/RefreshTokenSesion";
import type { ICodigoSegundoFactorRepository } from "src/domain/repositories/ICodigoSegundoFactorRepository";
import type { IRefreshTokenSesionRepository } from "src/domain/repositories/IRefreshTokenSesionRepository";
import { AuthSessionService } from "./AuthSessionService";

const usuario = new Usuario({
  id: "user-1",
  username: "demo",
  nombreCompleto: "Usuario Demo",
  email: "demo@erp.local",
  passwordHash: "hashed:secret",
  rolId: 1,
  activo: true,
  twoFactorEnabled: true,
});

const passwordService: IPasswordService = {
  async hash(password) {
    return `hashed:${password}`;
  },
  async verify(password, hash) {
    return hash === `hashed:${password}`;
  },
};

const tokenService: ITokenService = {
  async sign(payload) {
    return `token:${String(payload.sub)}`;
  },
  async verify() {
    return {};
  },
};

const refreshTokenRepository: IRefreshTokenSesionRepository = {
  async save(_token: RefreshTokenSesion) {},
  async findValidByTokenHash() {
    return null;
  },
  async revokeById() {},
};

describe("AuthSessionService", () => {
  test("envia el codigo 2FA al email del usuario cuando no hay override", async () => {
    const savedCodes: CodigoSegundoFactor[] = [];
    const emailCalls: Array<{ to: string; subject: string; text: string }> = [];

    const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
      async save(codigo) {
        savedCodes.push(codigo);
      },
      async findPendingById() {
        return null;
      },
      async markUsed() {},
    };

    const emailService: IEmailService = {
      async send(input) {
        emailCalls.push({
          to: input.to,
          subject: input.subject,
          text: input.text,
        });
      },
    };

    const service = new AuthSessionService(
      codigoSegundoFactorRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
      false,
      emailService,
    );

    const result = await service.completeLogin(usuario);

    expect(result.requiresTwoFactor).toBe(true);
    expect(savedCodes).toHaveLength(1);
    expect(emailCalls).toHaveLength(1);
    expect(emailCalls[0]?.to).toBe(usuario.props.email);
  });

  test("envia el codigo 2FA al correo configurado", async () => {
    const savedCodes: CodigoSegundoFactor[] = [];
    const emailCalls: Array<{ to: string; subject: string; text: string }> = [];

    const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
      async save(codigo) {
        savedCodes.push(codigo);
      },
      async findPendingById() {
        return null;
      },
      async markUsed() {},
    };

    const emailService: IEmailService = {
      async send(input) {
        emailCalls.push({
          to: input.to,
          subject: input.subject,
          text: input.text,
        });
      },
    };

    const service = new AuthSessionService(
      codigoSegundoFactorRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
      false,
      emailService,
      undefined,
      "qa-2fa@erp.local",
    );

    const result = await service.completeLogin(usuario);

    expect(result.requiresTwoFactor).toBe(true);
    if (result.requiresTwoFactor) {
      expect(result.previewCode).toBeUndefined();
    }
    expect(savedCodes).toHaveLength(1);
    expect(emailCalls).toHaveLength(1);
    expect(emailCalls[0]?.to).toBe("qa-2fa@erp.local");
    expect(emailCalls[0]?.subject).toContain("Codigo");
  });

  test("falla si 2FA esta activo y no hay entrega configurada", async () => {
    const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
      async save() {},
      async findPendingById() {
        return null;
      },
      async markUsed() {},
    };

    const service = new AuthSessionService(
      codigoSegundoFactorRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
      false,
    );

    await expect(service.completeLogin(usuario)).rejects.toThrow(
      "El segundo factor por email no esta configurado",
    );
  });

  test("expone el detalle cuando falla el envio SMTP", async () => {
    const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
      async save() {},
      async findPendingById() {
        return null;
      },
      async markUsed() {},
    };

    const emailService: IEmailService = {
      async send() {
        throw new Error("self signed certificate in certificate chain");
      },
    };

    const service = new AuthSessionService(
      codigoSegundoFactorRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
      false,
      emailService,
    );

    await expect(service.completeLogin(usuario)).rejects.toThrow(
      "No se pudo enviar el codigo de segundo factor por correo: self signed certificate in certificate chain",
    );
  });

  test("envia el codigo 2FA por SMS cuando se solicita en login", async () => {
    const savedCodes: CodigoSegundoFactor[] = [];
    const phoneCalls: Array<{ to: string; channel: string }> = [];

    const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
      async save(codigo) {
        savedCodes.push(codigo);
      },
      async findPendingById() {
        return null;
      },
      async markUsed() {},
    };

    const phoneService: ITwoFactorPhoneService = {
      async sendCode(input) {
        phoneCalls.push({
          to: input.to,
          channel: input.channel,
        });
      },
    };

    const service = new AuthSessionService(
      codigoSegundoFactorRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
      false,
      undefined,
      phoneService,
    );

    const result = await service.completeLogin(usuario, {
      twoFactorChannel: "SMS",
      twoFactorPhoneNumber: "+59170000001",
    });

    expect(result.requiresTwoFactor).toBe(true);
    expect(savedCodes).toHaveLength(1);
    expect(savedCodes[0]?.props.canal).toBe("SMS");
    expect(phoneCalls).toEqual([
      {
        to: "+59170000001",
        channel: "SMS",
      },
    ]);
  });

  test("envia el codigo 2FA por WhatsApp cuando se solicita en login", async () => {
    const savedCodes: CodigoSegundoFactor[] = [];
    const phoneCalls: Array<{ to: string; channel: string }> = [];

    const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
      async save(codigo) {
        savedCodes.push(codigo);
      },
      async findPendingById() {
        return null;
      },
      async markUsed() {},
    };

    const phoneService: ITwoFactorPhoneService = {
      async sendCode(input) {
        phoneCalls.push({
          to: input.to,
          channel: input.channel,
        });
      },
    };

    const service = new AuthSessionService(
      codigoSegundoFactorRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
      false,
      undefined,
      phoneService,
    );

    const result = await service.completeLogin(usuario, {
      twoFactorChannel: "WHATSAPP",
      twoFactorPhoneNumber: "+59170000001",
    });

    expect(result.requiresTwoFactor).toBe(true);
    expect(savedCodes).toHaveLength(1);
    expect(savedCodes[0]?.props.canal).toBe("WHATSAPP");
    expect(savedCodes[0]?.props.destino).toBe("+59170000001");
    expect(phoneCalls).toEqual([
      {
        to: "+59170000001",
        channel: "WHATSAPP",
      },
    ]);
  });

  test("reenvia un desafio 2FA usando el destino almacenado y revoca el anterior", async () => {
    const savedCodes: CodigoSegundoFactor[] = [];
    const usedChallenges: string[] = [];
    const phoneCalls: Array<{ to: string; channel: string }> = [];

    const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
      async save(codigo) {
        savedCodes.push(codigo);
      },
      async findPendingById() {
        return null;
      },
      async markUsed(id) {
        usedChallenges.push(id);
      },
    };

    const phoneService: ITwoFactorPhoneService = {
      async sendCode(input) {
        phoneCalls.push({
          to: input.to,
          channel: input.channel,
        });
      },
    };

    const service = new AuthSessionService(
      codigoSegundoFactorRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
      false,
      undefined,
      phoneService,
    );

    const result = await service.reissueSecondFactorChallenge(
      usuario,
      new CodigoSegundoFactor({
        id: "challenge-1",
        usuarioId: usuario.props.id,
        codigoHash: "hashed:123456",
        canal: "WHATSAPP",
        destino: "+59170000001",
        expiresAt: new Date(Date.now() - 60_000),
      }),
    );

    expect(result.challengeId).toBeTruthy();
    expect(savedCodes).toHaveLength(1);
    expect(savedCodes[0]?.props.destino).toBe("+59170000001");
    expect(phoneCalls).toEqual([
      {
        to: "+59170000001",
        channel: "WHATSAPP",
      },
    ]);
    expect(usedChallenges).toEqual(["challenge-1"]);
  });

  test("falla si se solicita SMS sin numero telefonico", async () => {
    const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
      async save() {},
      async findPendingById() {
        return null;
      },
      async markUsed() {},
    };

    const service = new AuthSessionService(
      codigoSegundoFactorRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      "SMS",
    );

    await expect(service.completeLogin(usuario)).rejects.toThrow(
      "twoFactorPhoneNumber es obligatorio para SMS, WHATSAPP o VOICE",
    );
  });

  test("falla si el envio por llamada no esta configurado", async () => {
    const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
      async save() {},
      async findPendingById() {
        return null;
      },
      async markUsed() {},
    };

    const service = new AuthSessionService(
      codigoSegundoFactorRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
      false,
      undefined,
      undefined,
      undefined,
      "+59170000002",
      "VOICE",
    );

    await expect(service.completeLogin(usuario)).rejects.toThrow(
      "El segundo factor por llamada no esta configurado",
    );
  });

  test("rota el refresh token al refrescar una sesion", async () => {
    const revokedIds: string[] = [];
    const savedRefreshTokens: RefreshTokenSesion[] = [];

    const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
      async save() {},
      async findPendingById() {
        return null;
      },
      async markUsed() {},
    };

    const trackedRefreshRepository: IRefreshTokenSesionRepository = {
      async save(token) {
        savedRefreshTokens.push(token);
      },
      async findValidByTokenHash() {
        return null;
      },
      async revokeById(id) {
        revokedIds.push(id);
      },
    };

    const service = new AuthSessionService(
      codigoSegundoFactorRepository,
      trackedRefreshRepository,
      passwordService,
      tokenService,
      true,
    );

    const result = await service.rotateRefreshToken(
      {
        props: {
          id: "refresh-1",
          usuarioId: usuario.props.id,
          tokenHash: "hash",
          expiresAt: new Date(Date.now() + 60_000),
        },
      },
      usuario,
    );

    expect(revokedIds).toEqual(["refresh-1"]);
    expect(savedRefreshTokens).toHaveLength(1);
    expect(result.accessToken).toBe(`token:${usuario.props.id}`);
  });
});
