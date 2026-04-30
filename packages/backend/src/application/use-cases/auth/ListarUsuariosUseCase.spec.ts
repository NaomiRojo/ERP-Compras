import { describe, expect, test } from "bun:test";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";
import { Usuario } from "src/domain/entities/Usuario";
import { ListarUsuariosUseCase } from "./ListarUsuariosUseCase";

const items = [
  new Usuario({
    id: "1",
    username: "admin",
    nombreCompleto: "Administrador ERP",
    email: "admin@erp.local",
    passwordHash: "hashed:secret",
    rolId: 1,
    activo: true,
    twoFactorEnabled: true,
  }),
  new Usuario({
    id: "2",
    username: "operador",
    nombreCompleto: "Operador ERP",
    email: "operador@erp.local",
    passwordHash: "hashed:secret",
    rolId: 2,
    activo: true,
    twoFactorEnabled: false,
  }),
];

const usuarioRepository: IUsuarioRepository = {
  async save() {},
  async findAll() {
    return items;
  },
  async findById(id) {
    return items.find((item) => item.props.id === id) ?? null;
  },
  async findByEmail(email) {
    return items.find((item) => item.props.email === email) ?? null;
  },
  async findByGoogleSub(googleSub) {
    return items.find((item) => item.props.googleSub === googleSub) ?? null;
  },
  async findByUsername(username) {
    return items.find((item) => item.props.username === username) ?? null;
  },
};

describe("ListarUsuariosUseCase", () => {
  test("lista usuarios registrados", async () => {
    const useCase = new ListarUsuariosUseCase(usuarioRepository);

    const usuarios = await useCase.execute();

    expect(usuarios).toHaveLength(2);
    expect(usuarios[0]?.props.username).toBe("admin");
    expect(usuarios[1]?.props.username).toBe("operador");
  });
});
