import { describe, expect, test } from "bun:test";
import type { IEmailService } from "src/application/interfaces/IEmailService";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import { Usuario } from "src/domain/entities/Usuario";
import type { CodigoSegundoFactor } from "src/domain/entities/CodigoSegundoFactor";
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
      "jhovannyalave@gmail.com",
    );

    const result = await service.completeLogin(usuario);

    expect(result.requiresTwoFactor).toBe(true);
    if (result.requiresTwoFactor) {
      expect(result.previewCode).toBeUndefined();
    }
    expect(savedCodes).toHaveLength(1);
    expect(emailCalls).toHaveLength(1);
    expect(emailCalls[0]?.to).toBe("jhovannyalave@gmail.com");
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
});
