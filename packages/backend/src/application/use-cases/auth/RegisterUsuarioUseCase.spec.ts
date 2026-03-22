import { describe, expect, test } from "bun:test";
import { RegisterUsuarioUseCase } from "./RegisterUsuarioUseCase";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import type { Usuario } from "src/domain/entities/Usuario";

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

const passwordService: IPasswordService = {
  async hash(password) {
    return `hashed:${password}`;
  },
  async verify(password, hash) {
    return hash === `hashed:${password}`;
  },
};

const unitOfWork: IUnitOfWork = {
  async start() {},
  async commit() {},
  async rollback() {},
  async release() {},
};

describe("RegisterUsuarioUseCase", () => {
  test("registra un usuario nuevo", async () => {
    const useCase = new RegisterUsuarioUseCase(createUsuarioRepository(), passwordService, unitOfWork);

    const usuario = await useCase.execute({
      username: "admin",
      nombreCompleto: "Administrador ERP",
      email: "admin@erp.local",
      password: "secret123",
    });

    expect(usuario.props.username).toBe("admin");
    expect(usuario.props.email).toBe("admin@erp.local");
    expect(usuario.props.passwordHash).toBe("hashed:secret123");
    expect(usuario.props.twoFactorEnabled).toBe(true);
  });

  test("rechaza emails duplicados", async () => {
    const repository = createUsuarioRepository();
    const useCase = new RegisterUsuarioUseCase(repository, passwordService, unitOfWork);

    await useCase.execute({
      username: "admin",
      nombreCompleto: "Administrador ERP",
      email: "admin@erp.local",
      password: "secret123",
    });

    await expect(
      useCase.execute({
        username: "admin2",
        nombreCompleto: "Administrador ERP 2",
        email: "admin@erp.local",
        password: "secret123",
      }),
    ).rejects.toThrow("Ya existe un usuario con ese email");
  });
});
