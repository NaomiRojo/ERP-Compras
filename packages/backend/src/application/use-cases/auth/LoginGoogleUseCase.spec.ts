import { describe, expect, test } from "bun:test";
import { LoginGoogleUseCase } from "./LoginGoogleUseCase";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";
import type { IGoogleIdentityService } from "src/application/interfaces/IGoogleIdentityService";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import type { Usuario } from "src/domain/entities/Usuario";
import { AuthSessionService } from "./AuthSessionService";
import type { ICodigoSegundoFactorRepository } from "src/domain/repositories/ICodigoSegundoFactorRepository";
import type { IRefreshTokenSesionRepository } from "src/domain/repositories/IRefreshTokenSesionRepository";
import type { ITokenService } from "src/application/interfaces/ITokenService";

const createUsuarioRepository = (): IUsuarioRepository => {
  const items = new Map<string, Usuario>();

  return {
    async save(usuario) {
      items.set(usuario.props.id, usuario);
    },
    async findAll() {
      return [...items.values()];
    },
    async findById(id) {
      return items.get(id) ?? null;
    },
    async findByEmail(email) {
      return [...items.values()].find((item) => item.props.email === email) ?? null;
    },
    async findByGoogleSub(googleSub) {
      return [...items.values()].find((item) => item.props.googleSub === googleSub) ?? null;
    },
    async findByUsername(username) {
      return [...items.values()].find((item) => item.props.username === username) ?? null;
    },
  };
};

const googleIdentityService: IGoogleIdentityService = {
  async verifyIdToken() {
    return {
      sub: "google-sub-1",
      email: "demo@gmail.com",
      emailVerified: true,
      name: "Demo Gmail",
    };
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

const codigoSegundoFactorRepository: ICodigoSegundoFactorRepository = {
  async save() {},
  async findPendingById() {
    return null;
  },
  async markUsed() {},
};

const refreshTokenRepository: IRefreshTokenSesionRepository = {
  async save() {},
  async findValidByTokenHash() {
    return null;
  },
  async revokeById() {},
};

const tokenService: ITokenService = {
  async sign(payload) {
    return `token:${String(payload.sub)}`;
  },
  async verify() {
    return {};
  },
};

const unitOfWork: IUnitOfWork = {
  async start() {},
  async commit() {},
  async rollback() {},
  async release() {},
};

describe("LoginGoogleUseCase", () => {
  test("crea usuario local y emite tokens con Google", async () => {
    const repository = createUsuarioRepository();
    const authSessionService = new AuthSessionService(
      codigoSegundoFactorRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
      true,
    );

    const useCase = new LoginGoogleUseCase(
      repository,
      googleIdentityService,
      passwordService,
      authSessionService,
      unitOfWork,
    );

    const result = await useCase.execute({
      credential: "fake-google-token",
    });

    expect(result.requiresTwoFactor).toBe(false);
    if (!result.requiresTwoFactor) {
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    }

    const usuario = await repository.findByGoogleSub("google-sub-1");
    expect(usuario?.props.email).toBe("demo@gmail.com");
  });
});
