import { describe, expect, test } from "bun:test";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { Articulo } from "src/domain/entities/Articulo";
import type { IArticuloRepository } from "src/domain/repositories/IArticuloRepository";
import { ActualizarArticuloUseCase } from "./ActualizarArticuloUseCase";
import { CrearArticuloUseCase } from "./CrearArticuloUseCase";
import { EliminarArticuloUseCase } from "./EliminarArticuloUseCase";

const createArticuloRepository = (): IArticuloRepository => {
  const items = new Map<string, Articulo>();

  return {
    async save(articulo) {
      items.set(articulo.props.id, articulo);
    },
    async findById(id) {
      return items.get(id) ?? null;
    },
    async findByItemCode(itemCode) {
      return [...items.values()].find((item) => item.props.itemCode === itemCode) ?? null;
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

describe("Articulo CRUD use cases", () => {
  test("crea un articulo con unidad por defecto", async () => {
    const useCase = new CrearArticuloUseCase(createArticuloRepository(), createUnitOfWork());

    const articulo = await useCase.execute({
      itemCode: "ITM-001",
      itemName: "Articulo Demo",
      costoEstandar: 12.5,
      grupoId: 1,
      impuestoId: 1,
    });

    expect(articulo.props.itemCode).toBe("ITM-001");
    expect(articulo.props.unidadMedida).toBe("UNI");
  });

  test("actualiza un articulo existente", async () => {
    const repository = createArticuloRepository();
    const createUseCase = new CrearArticuloUseCase(repository, createUnitOfWork());
    const articulo = await createUseCase.execute({
      itemCode: "ITM-001",
      itemName: "Articulo Demo",
      costoEstandar: 12.5,
      grupoId: 1,
      impuestoId: 1,
    });

    const updateUseCase = new ActualizarArticuloUseCase(repository, createUnitOfWork());
    const updated = await updateUseCase.execute(articulo.props.id, {
      itemCode: "ITM-001",
      itemName: "Articulo Actualizado",
      costoEstandar: 25,
      grupoId: 2,
      impuestoId: 2,
      unidadMedida: "CJ",
    });

    expect(updated.props.itemName).toBe("Articulo Actualizado");
    expect(updated.props.unidadMedida).toBe("CJ");
    expect(updated.props.impuestoId).toBe(2);
  });

  test("eliminar articulo falla si no existe", async () => {
    const useCase = new EliminarArticuloUseCase(createArticuloRepository());
    await expect(useCase.execute("missing-id")).rejects.toThrow("Articulo no encontrado");
  });
});
