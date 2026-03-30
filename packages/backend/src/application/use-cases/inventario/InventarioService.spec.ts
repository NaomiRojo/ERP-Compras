import { describe, expect, test } from "bun:test";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import type { AuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import { ArticuloAlmacenStock } from "src/domain/entities/ArticuloAlmacenStock";
import type { DiarioInventarioMovimiento } from "src/domain/entities/DiarioInventarioMovimiento";
import type { IArticuloAlmacenRepository } from "src/domain/repositories/IArticuloAlmacenRepository";
import type { IAuditoriaEventoRepository } from "src/domain/repositories/IAuditoriaEventoRepository";
import type { IDiarioInventarioRepository } from "src/domain/repositories/IDiarioInventarioRepository";
import { InventarioService } from "./InventarioService";

const createUnitOfWork = (): IUnitOfWork => ({
  async start() {},
  async commit() {},
  async rollback() {},
  async release() {},
});

describe("InventarioService", () => {
  test("registra entradas de inventario y actualiza el stock disponible", async () => {
    let currentStock = new ArticuloAlmacenStock({
      id: "stock-1",
      articuloId: "item-1",
      almacenId: "ALM-01",
      stockFisico: 2,
      comprometido: 0,
      solicitado: 0,
      stockDisponible: 2,
    });
    let savedStock: ArticuloAlmacenStock | null = null;
    let savedMovimiento: DiarioInventarioMovimiento | null = null;
    const savedEventos: AuditoriaEvento[] = [];

    const stockRepository: IArticuloAlmacenRepository = {
      async findByArticuloAndAlmacen() {
        return currentStock;
      },
      async listAll() {
        return [currentStock];
      },
      async listByArticuloId() {
        return [currentStock];
      },
      async save(stock) {
        savedStock = stock;
        currentStock = stock;
      },
    };

    const diarioRepository: IDiarioInventarioRepository = {
      async findById() {
        return savedMovimiento;
      },
      async listAll() {
        return savedMovimiento ? [savedMovimiento] : [];
      },
      async save(movimiento) {
        savedMovimiento = movimiento;
      },
    };

    const auditoriaRepository: IAuditoriaEventoRepository = {
      async findById() {
        return savedEventos[0] ?? null;
      },
      async listAll() {
        return savedEventos;
      },
      async save(evento) {
        savedEventos.push(evento);
      },
    };

    const service = new InventarioService(
      stockRepository,
      diarioRepository,
      createUnitOfWork(),
      auditoriaRepository,
    );

    const movimiento = await service.registrarMovimiento(
      {
        articuloId: "item-1",
        almacenId: "ALM-01",
        docReferenciaId: "doc-1",
        tipoMovimiento: "IN",
        cantidad: 3,
        costoMomento: 100,
        comentario: "Recepcion parcial",
      },
      "user-1",
    );

    expect(movimiento.props.tipoMovimiento).toBe("IN");
    if (!savedMovimiento || !savedStock) {
      throw new Error("Los repositorios de inventario no guardaron los cambios esperados");
    }
    const persistedMovimiento: DiarioInventarioMovimiento = savedMovimiento;
    const persistedStock: ArticuloAlmacenStock = savedStock;
    expect(persistedMovimiento.props.articuloId).toBe("item-1");
    expect(persistedStock.props.stockFisico).toBe(5);
    expect(persistedStock.props.stockDisponible).toBe(5);
    expect(savedEventos).toHaveLength(1);
    expect(savedEventos[0]?.props.entidad).toBe("diario_inventario");
  });

  test("rechaza salidas que dejan el stock en negativo", async () => {
    const currentStock = new ArticuloAlmacenStock({
      id: "stock-1",
      articuloId: "item-1",
      almacenId: "ALM-01",
      stockFisico: 1,
      comprometido: 0,
      solicitado: 0,
      stockDisponible: 1,
    });

    const stockRepository: IArticuloAlmacenRepository = {
      async findByArticuloAndAlmacen() {
        return currentStock;
      },
      async listAll() {
        return [currentStock];
      },
      async listByArticuloId() {
        return [currentStock];
      },
      async save() {},
    };

    const diarioRepository: IDiarioInventarioRepository = {
      async findById() {
        return null;
      },
      async listAll() {
        return [];
      },
      async save() {},
    };

    const service = new InventarioService(
      stockRepository,
      diarioRepository,
      createUnitOfWork(),
    );

    await expect(
      service.registrarMovimiento(
        {
          articuloId: "item-1",
          almacenId: "ALM-01",
          docReferenciaId: "doc-1",
          tipoMovimiento: "OUT",
          cantidad: 2,
          costoMomento: 100,
        },
        "user-1",
      ),
    ).rejects.toThrow("El movimiento dejaria stock negativo");
  });
});
