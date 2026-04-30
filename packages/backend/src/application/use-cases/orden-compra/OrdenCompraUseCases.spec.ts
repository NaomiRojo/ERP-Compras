import { describe, expect, test } from "bun:test";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import type { RegistrarRecepcionOrdenCompraDto } from "src/application/dtos/orden-compra/RegistrarRecepcionOrdenCompraDto";
import { ESTADO_DOCUMENTO_IDS, TIPO_DOCUMENTO_IDS } from "src/domain/documentos";
import { ArticuloAlmacenStock } from "src/domain/entities/ArticuloAlmacenStock";
import { DiarioInventarioMovimiento } from "src/domain/entities/DiarioInventarioMovimiento";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import { OrdenCompraDetalle } from "src/domain/entities/OrdenCompraDetalle";
import type { IArticuloAlmacenRepository } from "src/domain/repositories/IArticuloAlmacenRepository";
import type { IDiarioInventarioRepository } from "src/domain/repositories/IDiarioInventarioRepository";
import type { IImpuestoRepository } from "src/domain/repositories/IImpuestoRepository";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";
import { ActualizarOrdenCompraUseCase } from "./ActualizarOrdenCompraUseCase";
import { AprobarOrdenCompraUseCase } from "./AprobarOrdenCompraUseCase";
import { CrearOrdenCompraUseCase } from "./CrearOrdenCompraUseCase";
import { EliminarOrdenCompraUseCase } from "./EliminarOrdenCompraUseCase";
import { RegistrarRecepcionOrdenCompraUseCase } from "./RegistrarRecepcionOrdenCompraUseCase";

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

const createExistingOrder = (overrides: Partial<OrdenCompra["props"]> = {}) =>
  new OrdenCompra({
    id: "order-1",
    tipoDocId: TIPO_DOCUMENTO_IDS.PEDIDO_COMPRA,
    docNum: 8,
    proveedorId: "provider-1",
    estadoId: ESTADO_DOCUMENTO_IDS.BORRADOR,
    monedaId: 1,
    fechaDocumento: new Date("2026-03-26"),
    subtotal: 50,
    descuentoTotal: 0,
    impuestosTotal: 6.5,
    totalDocumento: 56.5,
    comentarios: "original",
    createdBy: "creator-user",
    detalles: [
      new OrdenCompraDetalle({
        id: "detail-1",
        lineNum: 0,
        articuloId: "item-1",
        almacenId: "ALM-01",
        impuestoId: 1,
        cantidadTotal: 10,
        cantidadPendiente: 10,
        precioUnitario: 25,
        descuentoLinea: 0,
        subtotalLinea: 250,
        totalLinea: 282.5,
      }),
    ],
    ...overrides,
  });

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

    const existingOrder = createExistingOrder();

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

  test("aprueba una orden en borrador y registra el aprobador", async () => {
    let saved: OrdenCompra | null = null;
    const existingOrder = createExistingOrder();

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

    const useCase = new AprobarOrdenCompraUseCase(repository, createUnitOfWork());
    const orden = await useCase.execute("order-1", "supervisor-user");

    expect(saved).not.toBeNull();
    expect(orden.props.estadoId).toBe(ESTADO_DOCUMENTO_IDS.APROBADO);
    expect(orden.props.approvedBy).toBe("supervisor-user");
  });

  test("rechaza aprobar una orden que ya no esta en borrador", async () => {
    const existingOrder = createExistingOrder({
      estadoId: ESTADO_DOCUMENTO_IDS.APROBADO,
      approvedBy: "supervisor-user",
    });

    const repository: IOrdenCompraRepository = {
      async save() {},
      async findById(id) {
        return id === existingOrder.props.id ? existingOrder : null;
      },
      async findAll() {
        return [existingOrder];
      },
      async deleteById() {
        return false;
      },
      async nextDocNum() {
        return 9;
      },
    };

    const useCase = new AprobarOrdenCompraUseCase(repository, createUnitOfWork());

    await expect(useCase.execute("order-1", "supervisor-user")).rejects.toThrow(
      "La orden de compra ya fue aprobada",
    );
  });

  test("rechaza actualizar una orden aprobada", async () => {
    const existingOrder = createExistingOrder({
      estadoId: ESTADO_DOCUMENTO_IDS.APROBADO,
      approvedBy: "supervisor-user",
    });

    const repository: IOrdenCompraRepository = {
      async save() {},
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

    await expect(
      useCase.execute(
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
            },
          ],
        },
        "editor-user",
      ),
    ).rejects.toThrow("Solo se pueden actualizar ordenes en estado BORRADOR");
  });

  test("rechaza eliminar una orden aprobada", async () => {
    const existingOrder = createExistingOrder({
      estadoId: ESTADO_DOCUMENTO_IDS.APROBADO,
      approvedBy: "supervisor-user",
    });

    const repository: IOrdenCompraRepository = {
      async save() {},
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

    const useCase = new EliminarOrdenCompraUseCase(repository);

    await expect(useCase.execute("order-1")).rejects.toThrow(
      "Solo se pueden eliminar ordenes en estado BORRADOR",
    );
  });

  test("registra una recepcion parcial y deja la orden abierta", async () => {
    const savedDocs: OrdenCompra[] = [];
    const savedStocks: ArticuloAlmacenStock[] = [];
    const savedMovimientos: DiarioInventarioMovimiento[] = [];
    const existingOrder = createExistingOrder({
      estadoId: ESTADO_DOCUMENTO_IDS.APROBADO,
      approvedBy: "supervisor-user",
    });

    const repository: IOrdenCompraRepository = {
      async save(ordenCompra) {
        savedDocs.push(ordenCompra);
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
      async nextDocNum(tipoDocId) {
        return tipoDocId === TIPO_DOCUMENTO_IDS.ENTRADA_MERCADERIA ? 33 : 9;
      },
    };

    const stockRepository: IArticuloAlmacenRepository = {
      async findByArticuloAndAlmacen() {
        return null;
      },
      async listAll() {
        return [];
      },
      async listByArticuloId() {
        return [];
      },
      async save(stock) {
        savedStocks.push(stock);
      },
    };

    const diarioRepository: IDiarioInventarioRepository = {
      async findById() {
        return null;
      },
      async listAll() {
        return [];
      },
      async save(movimiento) {
        savedMovimientos.push(movimiento);
      },
    };

    const dto: RegistrarRecepcionOrdenCompraDto = {
      fechaDocumento: "2026-04-02",
      comentarios: "Recepcion parcial",
      detalles: [{ lineNum: 0, cantidadRecibida: 4 }],
    };

    const useCase = new RegistrarRecepcionOrdenCompraUseCase(
      repository,
      impuestoRepository,
      stockRepository,
      diarioRepository,
      createUnitOfWork(),
    );

    const result = await useCase.execute("order-1", dto, "almacen-user");

    expect(result.ordenCompra.props.estadoId).toBe(ESTADO_DOCUMENTO_IDS.ABIERTO);
    expect(result.ordenCompra.props.detalles[0]?.props.cantidadPendiente).toBe(6);
    expect(result.recepcion.props.tipoDocId).toBe(TIPO_DOCUMENTO_IDS.ENTRADA_MERCADERIA);
    expect(result.recepcion.props.estadoId).toBe(ESTADO_DOCUMENTO_IDS.CERRADO);
    expect(result.recepcion.props.detalles[0]?.props.cantidadPendiente).toBe(0);
    expect(result.recepcion.props.detalles[0]?.props.baseEntry).toBe("order-1");
    expect(result.recepcion.props.detalles[0]?.props.baseLine).toBe(0);
    expect(savedDocs).toHaveLength(2);
    expect(savedStocks[0]?.props.stockFisico).toBe(4);
    expect(savedStocks[0]?.props.stockDisponible).toBe(4);
    expect(savedMovimientos[0]?.props.docReferenciaId).toBe(result.recepcion.props.id);
    expect(savedMovimientos[0]?.props.tipoMovimiento).toBe("IN");
    expect(savedMovimientos[0]?.props.cantidad).toBe(4);
  });

  test("cierra la orden cuando la recepcion completa el pendiente", async () => {
    const existingOrder = createExistingOrder({
      estadoId: ESTADO_DOCUMENTO_IDS.ABIERTO,
      approvedBy: "supervisor-user",
      detalles: [
        new OrdenCompraDetalle({
          id: "detail-1",
          lineNum: 0,
          articuloId: "item-1",
          almacenId: "ALM-01",
          impuestoId: 1,
          cantidadTotal: 10,
          cantidadPendiente: 2,
          precioUnitario: 25,
          descuentoLinea: 0,
          subtotalLinea: 250,
          totalLinea: 282.5,
        }),
      ],
    });

    const repository: IOrdenCompraRepository = {
      async save() {},
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
        return 44;
      },
    };

    const stockRepository: IArticuloAlmacenRepository = {
      async findByArticuloAndAlmacen() {
        return null;
      },
      async listAll() {
        return [];
      },
      async listByArticuloId() {
        return [];
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

    const useCase = new RegistrarRecepcionOrdenCompraUseCase(
      repository,
      impuestoRepository,
      stockRepository,
      diarioRepository,
      createUnitOfWork(),
    );

    const result = await useCase.execute(
      "order-1",
      {
        fechaDocumento: "2026-04-03",
        detalles: [{ lineNum: 0, cantidadRecibida: 2 }],
      },
      "almacen-user",
    );

    expect(result.ordenCompra.props.estadoId).toBe(ESTADO_DOCUMENTO_IDS.CERRADO);
    expect(result.ordenCompra.props.detalles[0]?.props.cantidadPendiente).toBe(0);
  });
});
