import { describe, expect, test } from "bun:test";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { IImpuestoRepository } from "src/domain/repositories/IImpuestoRepository";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";
import { ActualizarOrdenCompraUseCase } from "./ActualizarOrdenCompraUseCase";
import { CrearOrdenCompraUseCase } from "./CrearOrdenCompraUseCase";

const createUnitOfWork = (): IUnitOfWork => ({
  async start() {},
  async commit() {},
  async rollback() {},
  async release() {},
});

const impuestoRepository: IImpuestoRepository = {
  async findPorcentajeById(id) {
    return id === 1 ? 13 : null;
  },
};

describe("OrdenCompra use cases", () => {
  test("calcula impuestos y total al crear una orden", async () => {
    let saved: OrdenCompra | null = null;

    const repository: IOrdenCompraRepository = {
      async save(ordenCompra) {
        saved = ordenCompra;
      },
      async findById() {
        return null;
      },
      async findAll() {
        return [];
      },
      async deleteById() {
        return false;
      },
      async nextDocNum() {
        return 15;
      },
    };

    const useCase = new CrearOrdenCompraUseCase(repository, impuestoRepository, createUnitOfWork());
    const orden = await useCase.execute(
      {
        proveedorId: "provider-1",
        monedaId: 1,
        fechaDocumento: "2026-03-26",
        detalles: [
          {
            articuloId: "item-1",
            almacenId: "ALM-01",
            impuestoId: 1,
            cantidadTotal: 2,
            precioUnitario: 45,
          },
        ],
      },
      "user-1",
    );

    expect(saved).not.toBeNull();
    expect(orden.props.impuestosTotal).toBe(11.7);
    expect(orden.props.totalDocumento).toBe(101.7);
    expect(orden.props.docNum).toBe(15);
  });

  test("preserva createdBy al actualizar una orden", async () => {
    let saved: OrdenCompra | null = null;

    const existingOrder = new OrdenCompra({
      id: "order-1",
      tipoDocId: 2,
      docNum: 8,
      proveedorId: "provider-1",
      estadoId: 1,
      monedaId: 1,
      fechaDocumento: new Date("2026-03-26"),
      subtotal: 50,
      descuentoTotal: 0,
      impuestosTotal: 6.5,
      totalDocumento: 56.5,
      comentarios: "original",
      createdBy: "creator-user",
      detalles: [],
    });

    const repository: IOrdenCompraRepository = {
      async save(ordenCompra) {
        saved = ordenCompra;
      },
      async findById(id) {
        return id === existingOrder.props.id ? existingOrder : null;
      },
      async findAll() {
        return [existingOrder];
      },
      async deleteById() {
        return true;
      },
      async nextDocNum() {
        return 9;
      },
    };

    const useCase = new ActualizarOrdenCompraUseCase(repository, impuestoRepository, createUnitOfWork());
    const orden = await useCase.execute(
      "order-1",
      {
        proveedorId: "provider-1",
        monedaId: 1,
        fechaDocumento: "2026-03-27",
        detalles: [
          {
            articuloId: "item-1",
            almacenId: "ALM-01",
            impuestoId: 1,
            cantidadTotal: 1,
            precioUnitario: 100,
            descuentoLinea: 10,
          },
        ],
      },
      "editor-user",
    );

    expect(saved).not.toBeNull();
    expect(orden.props.createdBy).toBe("creator-user");
    expect(orden.props.impuestosTotal).toBe(11.7);
    expect(orden.props.totalDocumento).toBe(101.7);
  });
});
