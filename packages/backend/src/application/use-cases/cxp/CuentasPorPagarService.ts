import type { CrearCuentaPorPagarDto } from "src/application/dtos/cxp/CrearCuentaPorPagarDto";
import type { RegistrarPagoProveedorDto } from "src/application/dtos/cxp/RegistrarPagoProveedorDto";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { createAuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import {
  CuentaPorPagar,
  type EstadoCuentaPorPagar,
} from "src/domain/entities/CuentaPorPagar";
import { PagoProveedor } from "src/domain/entities/PagoProveedor";
import type { IAuditoriaEventoRepository } from "src/domain/repositories/IAuditoriaEventoRepository";
import type { ICuentaPorPagarRepository } from "src/domain/repositories/ICuentaPorPagarRepository";
import type { IPagoProveedorRepository } from "src/domain/repositories/IPagoProveedorRepository";

const resolveEstadoCuenta = (saldoPendiente: number, montoTotal: number): EstadoCuentaPorPagar => {
  if (saldoPendiente <= 0) {
    return "PAGADA";
  }

  if (saldoPendiente < montoTotal) {
    return "PARCIAL";
  }

  return "PENDIENTE";
};

export class CuentasPorPagarService {
  public constructor(
    private readonly cuentaPorPagarRepository: ICuentaPorPagarRepository,
    private readonly pagoProveedorRepository: IPagoProveedorRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly auditoriaEventoRepository?: IAuditoriaEventoRepository,
  ) {}

  public listarCuentasPorPagar(): Promise<CuentaPorPagar[]> {
    return this.cuentaPorPagarRepository.listAll();
  }

  public async obtenerCuentaPorPagar(id: string): Promise<CuentaPorPagar> {
    const cuentaId = id.trim();
    if (!cuentaId) {
      throw new Error("id es obligatorio");
    }

    const cuenta = await this.cuentaPorPagarRepository.findById(cuentaId);
    if (!cuenta) {
      throw new Error("Cuenta por pagar no encontrada");
    }

    return cuenta;
  }

  public listarPagosProveedor(): Promise<PagoProveedor[]> {
    return this.pagoProveedorRepository.listAll();
  }

  public async obtenerPagoProveedor(id: string): Promise<PagoProveedor> {
    const pagoId = id.trim();
    if (!pagoId) {
      throw new Error("id es obligatorio");
    }

    const pago = await this.pagoProveedorRepository.findById(pagoId);
    if (!pago) {
      throw new Error("Pago a proveedor no encontrado");
    }

    return pago;
  }

  public async crearCuentaPorPagar(
    dto: CrearCuentaPorPagarDto,
    currentUserId: string,
  ): Promise<CuentaPorPagar> {
    const compraId = dto.compraId.trim();
    const proveedorId = dto.proveedorId.trim();
    const numeroFactura = dto.numeroFactura.trim();

    if (!compraId || !proveedorId || !numeroFactura) {
      throw new Error("compraId, proveedorId y numeroFactura son obligatorios");
    }

    if (dto.montoTotal <= 0) {
      throw new Error("montoTotal debe ser mayor a cero");
    }

    const fechaVencimiento = new Date(dto.fechaVencimiento);
    if (Number.isNaN(fechaVencimiento.getTime())) {
      throw new Error("fechaVencimiento invalida");
    }

    await this.unitOfWork.start();

    try {
      const duplicado = await this.cuentaPorPagarRepository.findByProveedorAndNumeroFactura(
        proveedorId,
        numeroFactura,
      );
      if (duplicado) {
        throw new Error("Ya existe una cuenta por pagar para esa factura");
      }

      const cuentaPorPagar = new CuentaPorPagar({
        id: crypto.randomUUID(),
        compraId,
        proveedorId,
        numeroFactura,
        montoTotal: dto.montoTotal,
        saldoPendiente: dto.montoTotal,
        fechaVencimiento,
        estado: "PENDIENTE",
      });

      await this.cuentaPorPagarRepository.save(cuentaPorPagar);

      if (this.auditoriaEventoRepository) {
        await this.auditoriaEventoRepository.save(
          createAuditoriaEvento({
            usuarioId: currentUserId,
            entidad: "cxp_cuentas_por_pagar",
            entidadId: cuentaPorPagar.props.id,
            accion: "CREAR",
            datosDespues: {
              compraId,
              proveedorId,
              numeroFactura,
              montoTotal: dto.montoTotal,
              estado: "PENDIENTE",
            },
          }),
        );
      }

      await this.unitOfWork.commit();
      return cuentaPorPagar;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    } finally {
      await this.unitOfWork.release();
    }
  }

  public async registrarPagoProveedor(
    cuentaPorPagarId: string,
    dto: RegistrarPagoProveedorDto,
    currentUserId: string,
  ): Promise<PagoProveedor> {
    const cuentaId = cuentaPorPagarId.trim();
    if (!cuentaId) {
      throw new Error("cuentaPorPagarId es obligatorio");
    }

    if (dto.monto <= 0) {
      throw new Error("monto debe ser mayor a cero");
    }

    const fechaPago = new Date(dto.fechaPago);
    if (Number.isNaN(fechaPago.getTime())) {
      throw new Error("fechaPago invalida");
    }

    await this.unitOfWork.start();

    try {
      const cuenta = await this.cuentaPorPagarRepository.findById(cuentaId);
      if (!cuenta) {
        throw new Error("Cuenta por pagar no encontrada");
      }

      if (cuenta.props.estado === "ANULADA" || cuenta.props.estado === "PAGADA") {
        throw new Error("La cuenta por pagar no admite mas pagos");
      }

      if (dto.monto > cuenta.props.saldoPendiente) {
        throw new Error("El pago excede el saldo pendiente");
      }

      const saldoPendiente = Number((cuenta.props.saldoPendiente - dto.monto).toFixed(2));
      const pago = new PagoProveedor({
        id: crypto.randomUUID(),
        cuentaPorPagarId: cuenta.props.id,
        proveedorId: cuenta.props.proveedorId,
        monto: dto.monto,
        fechaPago,
        referencia: dto.referencia?.trim() || undefined,
        createdBy: currentUserId,
      });

      const cuentaActualizada = new CuentaPorPagar({
        ...cuenta.props,
        saldoPendiente,
        estado: resolveEstadoCuenta(saldoPendiente, cuenta.props.montoTotal),
      });

      await this.pagoProveedorRepository.save(pago);
      await this.cuentaPorPagarRepository.save(cuentaActualizada);

      if (this.auditoriaEventoRepository) {
        await this.auditoriaEventoRepository.save(
          createAuditoriaEvento({
            usuarioId: currentUserId,
            entidad: "cxp_pagos_proveedor",
            entidadId: pago.props.id,
            accion: "CREAR",
            datosDespues: {
              cuentaPorPagarId: cuenta.props.id,
              monto: dto.monto,
              saldoPendiente,
              estadoCuenta: cuentaActualizada.props.estado,
            },
          }),
        );
      }

      await this.unitOfWork.commit();
      return pago;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    } finally {
      await this.unitOfWork.release();
    }
  }
}
