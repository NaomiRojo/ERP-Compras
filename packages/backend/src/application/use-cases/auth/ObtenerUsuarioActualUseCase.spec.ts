import { describe, expect, test } from "bun:test";
import { Usuario } from "src/domain/entities/Usuario";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";
import { ObtenerUsuarioActualUseCase } from "./ObtenerUsuarioActualUseCase";

const activeUser = new Usuario({
  id: "user-1",
  username: "demo",
  nombreCompleto: "Usuario Demo",
  email: "demo@erp.local",
  passwordHash: "hash",
  rolId: 2,
  activo: true,
  twoFactorEnabled: true,
});

const inactiveUser = new Usuario({
  ...activeUser.props,
  id: "user-2",
  email: "inactive@erp.local",
  activo: false,
});

const createRepository = (): IUsuarioRepository => ({
  async save() {},
  async findAll() {
    return [activeUser, inactiveUser];
  },
  async findById(id) {
    if (id === activeUser.props.id) {
      return activeUser;
    }

    if (id === inactiveUser.props.id) {
      return inactiveUser;
    }

    return null;
  },
  async findByEmail(email) {
    return [activeUser, inactiveUser].find((item) => item.props.email === email) ?? null;
  },
  async findByGoogleSub() {
    return null;
  },
  async findByUsername(username) {
    return [activeUser, inactiveUser].find((item) => item.props.username === username) ?? null;
  },
});

describe("ObtenerUsuarioActualUseCase", () => {
  test("devuelve el usuario activo solicitado", async () => {
    const useCase = new ObtenerUsuarioActualUseCase(createRepository());

    const usuario = await useCase.execute(" user-1 ");

    expect(usuario.props.id).toBe("user-1");
    expect(usuario.props.email).toBe("demo@erp.local");
  });

  test("rechaza userId vacio", async () => {
    const useCase = new ObtenerUsuarioActualUseCase(createRepository());

    await expect(useCase.execute("   ")).rejects.toThrow("userId es obligatorio");
  });

  test("rechaza usuario inexistente o inactivo", async () => {
    const useCase = new ObtenerUsuarioActualUseCase(createRepository());

    await expect(useCase.execute("missing")).rejects.toThrow("Usuario no encontrado");
    await expect(useCase.execute("user-2")).rejects.toThrow("Usuario no encontrado");
  });
});
