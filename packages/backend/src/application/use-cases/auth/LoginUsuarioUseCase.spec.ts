import { describe, expect, test } from "bun:test";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import { Usuario } from "src/domain/entities/Usuario";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";
import type { AuthLoginResponse, IAuthSessionService } from "./AuthSessionService";
import { LoginUsuarioUseCase } from "./LoginUsuarioUseCase";

const usuario = new Usuario({
  id: "user-1",
  username: "demo",
  nombreCompleto: "Usuario Demo",
  email: "demo@erp.local",
  passwordHash: "hashed:secret123",
  rolId: 2,
  activo: true,
  twoFactorEnabled: false,
});

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

const passwordService: IPasswordService = {
  async hash(password) {
    return `hashed:${password}`;
  },
  async verify(password, hash) {
    return hash === `hashed:${password}`;
  },
};

describe("LoginUsuarioUseCase", () => {
  test("inicia sesion con credenciales validas", async () => {
    const authSessionService: IAuthSessionService = {
      async completeLogin(_usuario, _options): Promise<AuthLoginResponse> {
        return {
          requiresTwoFactor: false,
          accessToken: "access-token",
          refreshToken: "refresh-token",
        };
      },
      async reissueSecondFactorChallenge() {
        throw new Error("Not implemented");
      },
      async issueTokens() {
        throw new Error("Not implemented");
      },
      async rotateRefreshToken() {
        throw new Error("Not implemented");
      },
      async validateRefreshToken() {
        throw new Error("Not implemented");
      },
    };

    const useCase = new LoginUsuarioUseCase(usuarioRepository, passwordService, authSessionService);

    const result = await useCase.execute({
      email: "demo@erp.local",
      password: "secret123",
    });

    expect(result.requiresTwoFactor).toBe(false);
    if (!result.requiresTwoFactor) {
      expect(result.accessToken).toBe("access-token");
    }
  });

  test("rechaza password invalido", async () => {
    const authSessionService: IAuthSessionService = {
      async completeLogin(_usuario, _options): Promise<AuthLoginResponse> {
        return {
          requiresTwoFactor: false,
          accessToken: "access-token",
          refreshToken: "refresh-token",
        };
      },
      async reissueSecondFactorChallenge() {
        throw new Error("Not implemented");
      },
      async issueTokens() {
        throw new Error("Not implemented");
      },
      async rotateRefreshToken() {
        throw new Error("Not implemented");
      },
      async validateRefreshToken() {
        throw new Error("Not implemented");
      },
    };

    const useCase = new LoginUsuarioUseCase(usuarioRepository, passwordService, authSessionService);

    await expect(
      useCase.execute({
        email: "demo@erp.local",
        password: "otro-password",
      }),
    ).rejects.toThrow("Credenciales invalidas");
  });
});
