import { describe, expect, test } from "bun:test";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import type { AuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import { CuentaPorPagar } from "src/domain/entities/CuentaPorPagar";
import type { PagoProveedor } from "src/domain/entities/PagoProveedor";
import type { IAuditoriaEventoRepository } from "src/domain/repositories/IAuditoriaEventoRepository";
import type { ICuentaPorPagarRepository } from "src/domain/repositories/ICuentaPorPagarRepository";
import type { IPagoProveedorRepository } from "src/domain/repositories/IPagoProveedorRepository";
import { CuentasPorPagarService } from "./CuentasPorPagarService";

const createUnitOfWork = (): IUnitOfWork => ({
  async start() {},
  async commit() {},
  async rollback() {},
  async release() {},
});

describe("CuentasPorPagarService", () => {
  test("crea una cuenta por pagar pendiente y registra auditoria", async () => {
    let savedCuenta: CuentaPorPagar | null = null;
    const savedEventos: AuditoriaEvento[] = [];

    const cuentaRepository: ICuentaPorPagarRepository = {
      async findById() {
        return savedCuenta;
      },
      async findByProveedorAndNumeroFactura() {
        return null;
      },
      async listAll() {
        return savedCuenta ? [savedCuenta] : [];
      },
      async save(cuenta) {
        savedCuenta = cuenta;
      },
    };

    const pagoRepository: IPagoProveedorRepository = {
      async findById() {
        return null;
      },
      async listAll() {
        return [];
      },
      async save() {},
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

    const service = new CuentasPorPagarService(
      cuentaRepository,
      pagoRepository,
      createUnitOfWork(),
      auditoriaRepository,
    );

    const cuenta = await service.crearCuentaPorPagar(
      {
        compraId: "compra-1",
        proveedorId: "proveedor-1",
        numeroFactura: "FAC-001",
        montoTotal: 565,
        fechaVencimiento: "2026-04-15",
      },
      "user-1",
    );

    expect(cuenta.props.estado).toBe("PENDIENTE");
    if (!savedCuenta) {
      throw new Error("La cuenta por pagar no fue guardada");
    }
    const persistedCuenta: CuentaPorPagar = savedCuenta;
    expect(persistedCuenta.props.saldoPendiente).toBe(565);
    expect(savedEventos).toHaveLength(1);
    expect(savedEventos[0]?.props.entidad).toBe("cxp_cuentas_por_pagar");
  });

  test("registra pagos parciales y actualiza el saldo pendiente", async () => {
    let currentCuenta = new CuentaPorPagar({
      id: "cuenta-1",
      compraId: "compra-1",
      proveedorId: "proveedor-1",
      numeroFactura: "FAC-001",
      montoTotal: 565,
      saldoPendiente: 565,
      fechaVencimiento: new Date("2026-04-15"),
      estado: "PENDIENTE",
    });
    let savedCuenta: CuentaPorPagar | null = null;
    let savedPago: PagoProveedor | null = null;

    const cuentaRepository: ICuentaPorPagarRepository = {
      async findById() {
        return currentCuenta;
      },
      async findByProveedorAndNumeroFactura() {
        return null;
      },
      async listAll() {
        return [currentCuenta];
      },
      async save(cuenta) {
        savedCuenta = cuenta;
        currentCuenta = cuenta;
      },
    };

    const pagoRepository: IPagoProveedorRepository = {
      async findById() {
        return savedPago;
      },
      async listAll() {
        return savedPago ? [savedPago] : [];
      },
      async save(pago) {
        savedPago = pago;
      },
    };

    const service = new CuentasPorPagarService(
      cuentaRepository,
      pagoRepository,
      createUnitOfWork(),
    );

    const pago = await service.registrarPagoProveedor(
      "cuenta-1",
      {
        monto: 200,
        fechaPago: "2026-03-27T12:00:00.000Z",
        referencia: "TRX-001",
      },
      "user-2",
    );

    expect(pago.props.cuentaPorPagarId).toBe("cuenta-1");
    if (!savedPago || !savedCuenta) {
      throw new Error("El pago o la actualizacion de saldo no fueron guardados");
    }
    const persistedPago: PagoProveedor = savedPago;
    const persistedCuenta: CuentaPorPagar = savedCuenta;
    expect(persistedPago.props.monto).toBe(200);
    expect(persistedCuenta.props.saldoPendiente).toBe(365);
    expect(persistedCuenta.props.estado).toBe("PARCIAL");
  });

  test("rechaza pagos que exceden el saldo pendiente", async () => {
    const currentCuenta = new CuentaPorPagar({
      id: "cuenta-1",
      compraId: "compra-1",
      proveedorId: "proveedor-1",
      numeroFactura: "FAC-001",
      montoTotal: 565,
      saldoPendiente: 100,
      fechaVencimiento: new Date("2026-04-15"),
      estado: "PENDIENTE",
    });

    const cuentaRepository: ICuentaPorPagarRepository = {
      async findById() {
        return currentCuenta;
      },
      async findByProveedorAndNumeroFactura() {
        return null;
      },
      async listAll() {
        return [currentCuenta];
      },
      async save() {},
    };

    const pagoRepository: IPagoProveedorRepository = {
      async findById() {
        return null;
      },
      async listAll() {
        return [];
      },
      async save() {},
    };

    const service = new CuentasPorPagarService(
      cuentaRepository,
      pagoRepository,
      createUnitOfWork(),
    );

    await expect(
      service.registrarPagoProveedor(
        "cuenta-1",
        {
          monto: 150,
          fechaPago: "2026-03-27T12:00:00.000Z",
        },
        "user-2",
      ),
    ).rejects.toThrow("El pago excede el saldo pendiente");
  });
});
