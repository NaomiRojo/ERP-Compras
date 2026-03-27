import { describe, expect, test } from "bun:test";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import { CodigoSegundoFactor } from "src/domain/entities/CodigoSegundoFactor";
import { RefreshTokenSesion } from "src/domain/entities/RefreshTokenSesion";
import { Usuario } from "src/domain/entities/Usuario";
import type { ICodigoSegundoFactorRepository } from "src/domain/repositories/ICodigoSegundoFactorRepository";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";
import type { IAuthSessionService } from "./AuthSessionService";
import { VerifySegundoFactorUseCase } from "./VerifySegundoFactorUseCase";

const usuario = new Usuario({
  id: "user-1",
  username: "demo",
  nombreCompleto: "Usuario Demo",
  email: "demo@erp.local",
  passwordHash: "hashed:secret123",
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

const usuarioRepository: IUsuarioRepository = {
  async save() {},
  async findAll() {
    return [usuario];
  },
  async findById(id) {
    return id === usuario.props.id ? usuario : null;
  },
  async findByEmail(email) {
    return email === usuario.props.email ? usuario : null;
  },
  async findByGoogleSub() {
    return null;
  },
  async findByUsername(username) {
    return username === usuario.props.username ? usuario : null;
  },
};

describe("VerifySegundoFactorUseCase", () => {
  test("verifica el codigo y emite tokens", async () => {
    const usedChallenges: string[] = [];
    const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
      async save() {},
      async findPendingById(id) {
        return id !== "challenge-1"
          ? null
          : new CodigoSegundoFactor({
              id: "challenge-1",
              usuarioId: usuario.props.id,
              codigoHash: "hashed:654321",
              canal: "EMAIL",
              expiresAt: new Date(Date.now() + 60_000),
            });
      },
      async markUsed(id) {
        usedChallenges.push(id);
      },
    };

    const authSessionService: IAuthSessionService = {
      async completeLogin() {
        throw new Error("Not implemented");
      },
      async issueTokens() {
        return {
          accessToken: "access-token",
          refreshToken: "refresh-token",
        };
      },
      async rotateRefreshToken() {
        throw new Error("Not implemented");
      },
      async validateRefreshToken() {
        throw new Error("Not implemented");
      },
    };

    const useCase = new VerifySegundoFactorUseCase(
      codigoSegundoFactorRepository,
      usuarioRepository,
      passwordService,
      authSessionService,
    );

    const result = await useCase.execute({
      challengeId: "challenge-1",
      code: "654321",
    });

    expect(usedChallenges).toEqual(["challenge-1"]);
    expect(result.accessToken).toBe("access-token");
  });

  test("revoca el refresh token anterior al refrescar", async () => {
    const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
      async save() {},
      async findPendingById() {
        return null;
      },
      async markUsed() {},
    };

    let rotatedSessionId = "";

    const authSessionService: IAuthSessionService = {
      async completeLogin() {
        throw new Error("Not implemented");
      },
      async issueTokens() {
        throw new Error("Not implemented");
      },
      async validateRefreshToken(token) {
        return token !== "refresh-123"
          ? null
          : new RefreshTokenSesion({
              id: "session-1",
              usuarioId: usuario.props.id,
              tokenHash: "hash",
              expiresAt: new Date(Date.now() + 60_000),
            });
      },
      async rotateRefreshToken(session) {
        rotatedSessionId = session.props.id;
        return {
          accessToken: "new-access",
          refreshToken: "new-refresh",
        };
      },
    };

    const useCase = new VerifySegundoFactorUseCase(
      codigoSegundoFactorRepository,
      usuarioRepository,
      passwordService,
      authSessionService,
    );

    const result = await useCase.refresh({
      refreshToken: "refresh-123",
    });

    expect(rotatedSessionId).toBe("session-1");
    expect(result.refreshToken).toBe("new-refresh");
  });
});
