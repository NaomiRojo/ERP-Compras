import { describe, expect, test } from "bun:test";
import { CrearProveedorUseCase } from "./CrearProveedorUseCase";
import type { IProveedorRepository } from "src/domain/repositories/IProveedorRepository";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { Proveedor } from "src/domain/entities/Proveedor";

const createProveedorRepository = (): IProveedorRepository => {
  const items = new Map<string, Proveedor>();

  return {
    async save(proveedor) {
      items.set(proveedor.props.id, proveedor);
    },
    async findById(id) {
      return items.get(id) ?? null;
    },
    async findByCardCode(cardCode) {
      return [...items.values()].find((item) => item.props.cardCode === cardCode) ?? null;
    },
    async findByNitRut(nitRut) {
      return [...items.values()].find((item) => item.props.nitRut === nitRut) ?? null;
    },
    async findAll() {
      return [...items.values()];
    },
    async deleteById(id) {
      return items.delete(id);
    },
  };
};

const createUnitOfWork = (): IUnitOfWork => ({
  async start() {},
  async commit() {},
  async rollback() {},
  async release() {},
});

describe("CrearProveedorUseCase", () => {
  test("crea un proveedor cuando cardCode y nitRut no existen", async () => {
    const useCase = new CrearProveedorUseCase(createProveedorRepository(), createUnitOfWork());

    const proveedor = await useCase.execute({
      cardCode: "PRV-001",
      cardName: "Proveedor Demo",
      nitRut: "1234567",
      monedaId: 1,
    });

    expect(proveedor.props.cardCode).toBe("PRV-001");
    expect(proveedor.props.cardName).toBe("Proveedor Demo");
    expect(proveedor.props.nitRut).toBe("1234567");
    expect(proveedor.props.activo).toBe(true);
  });

  test("rechaza un proveedor duplicado por cardCode", async () => {
    const repository = createProveedorRepository();
    const useCase = new CrearProveedorUseCase(repository, createUnitOfWork());

    await useCase.execute({
      cardCode: "PRV-001",
      cardName: "Proveedor Demo",
      nitRut: "1234567",
      monedaId: 1,
    });

    await expect(
      useCase.execute({
        cardCode: "PRV-001",
        cardName: "Proveedor Duplicado",
        nitRut: "7654321",
        monedaId: 1,
      }),
    ).rejects.toThrow("Ya existe un proveedor con ese cardCode");
  });
});
