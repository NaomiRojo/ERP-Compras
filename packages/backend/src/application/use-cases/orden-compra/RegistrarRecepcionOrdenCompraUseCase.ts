import type { RegistrarRecepcionOrdenCompraDto } from "src/application/dtos/orden-compra/RegistrarRecepcionOrdenCompraDto";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { ESTADO_DOCUMENTO_IDS, TIPO_DOCUMENTO_IDS } from "src/domain/documentos";
import { ArticuloAlmacenStock } from "src/domain/entities/ArticuloAlmacenStock";
import { createAuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import { DiarioInventarioMovimiento } from "src/domain/entities/DiarioInventarioMovimiento";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import { OrdenCompraDetalle } from "src/domain/entities/OrdenCompraDetalle";
import type { IArticuloAlmacenRepository } from "src/domain/repositories/IArticuloAlmacenRepository";
import type { IAuditoriaEventoRepository } from "src/domain/repositories/IAuditoriaEventoRepository";
import type { IDiarioInventarioRepository } from "src/domain/repositories/IDiarioInventarioRepository";
import type { IImpuestoRepository } from "src/domain/repositories/IImpuestoRepository";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";
import { buildOrdenCompraDetails } from "./buildOrdenCompraDetails";

const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;
const roundQuantity = (value: number): number =>
  Math.round((value + Number.EPSILON) * 10000) / 10000;

const resolveUpdatedOrderStatus = (ordenCompra: OrdenCompra): number =>
  ordenCompra.props.detalles.every((detalle) => detalle.props.cantidadPendiente <= 0)
    ? ESTADO_DOCUMENTO_IDS.CERRADO
    : ESTADO_DOCUMENTO_IDS.ABIERTO;

const allocateReceiptDiscount = (
  detalleOrden: OrdenCompraDetalle,
  cantidadRecibida: number,
): number => {
  if (detalleOrden.props.descuentoLinea <= 0 || detalleOrden.props.cantidadTotal <= 0) {
    return 0;
  }

  return roundMoney(
    (detalleOrden.props.descuentoLinea * cantidadRecibida) / detalleOrden.props.cantidadTotal,
  );
};

const increaseStock = (
  actual: ArticuloAlmacenStock | null,
  articuloId: string,
  almacenId: string,
  cantidad: number,
): ArticuloAlmacenStock =>
  new ArticuloAlmacenStock({
    id: actual?.props.id ?? crypto.randomUUID(),
    articuloId,
    almacenId,
    stockFisico: roundQuantity((actual?.props.stockFisico ?? 0) + cantidad),
    comprometido: actual?.props.comprometido ?? 0,
    solicitado: actual?.props.solicitado ?? 0,
    stockDisponible: roundQuantity((actual?.props.stockDisponible ?? 0) + cantidad),
  });

export interface RegistrarRecepcionOrdenCompraResult {
  ordenCompra: OrdenCompra;
  recepcion: OrdenCompra;
}

export class RegistrarRecepcionOrdenCompraUseCase {
  public constructor(
    private readonly ordenCompraRepository: IOrdenCompraRepository,
    private readonly impuestoRepository: IImpuestoRepository,
    private readonly articuloAlmacenRepository: IArticuloAlmacenRepository,
    private readonly diarioInventarioRepository: IDiarioInventarioRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly auditoriaEventoRepository?: IAuditoriaEventoRepository,
  ) {}

  public async execute(
    id: string,
    dto: RegistrarRecepcionOrdenCompraDto,
    currentUserId: string,
  ): Promise<RegistrarRecepcionOrdenCompraResult> {
    const ordenCompraId = id.trim();
    const usuarioId = currentUserId.trim();

    if (!ordenCompraId) {
      throw new Error("id es obligatorio");
    }

    if (!usuarioId) {
      throw new Error("currentUserId es obligatorio");
    }

    if (dto.detalles.length === 0) {
      throw new Error("La recepcion requiere al menos un detalle");
    }

    const fechaDocumento = new Date(dto.fechaDocumento);
    if (Number.isNaN(fechaDocumento.getTime())) {
      throw new Error("fechaDocumento invalida");
    }

    const ordenCompra = await this.ordenCompraRepository.findById(ordenCompraId);
    if (!ordenCompra) {
      throw new Error("Orden de compra no encontrada");
    }

    if (
      ordenCompra.props.estadoId !== ESTADO_DOCUMENTO_IDS.APROBADO &&
      ordenCompra.props.estadoId !== ESTADO_DOCUMENTO_IDS.ABIERTO
    ) {
      throw new Error("Solo se pueden registrar recepciones para ordenes APROBADAS o ABIERTAS");
    }

    const cantidadesRecibidasPorLinea = new Map<number, number>();
    const detallesOrdenPorLinea = new Map(
      ordenCompra.props.detalles.map((detalle) => [detalle.props.lineNum, detalle]),
    );

    for (const detalleRecepcion of dto.detalles) {
      if (!Number.isInteger(detalleRecepcion.lineNum) || detalleRecepcion.lineNum < 0) {
        throw new Error("Cada detalle de recepcion requiere lineNum valido");
      }

      if (detalleRecepcion.cantidadRecibida <= 0) {
        throw new Error("Cada detalle de recepcion requiere cantidadRecibida mayor a cero");
      }

      if (cantidadesRecibidasPorLinea.has(detalleRecepcion.lineNum)) {
        throw new Error("No se puede recibir la misma linea mas de una vez");
      }

      const detalleOrden = detallesOrdenPorLinea.get(detalleRecepcion.lineNum);
      if (!detalleOrden) {
        throw new Error(`Detalle de orden no encontrado: ${detalleRecepcion.lineNum}`);
      }

      if (detalleOrden.props.cantidadPendiente <= 0) {
        throw new Error(`La linea ${detalleRecepcion.lineNum} ya no tiene cantidad pendiente`);
      }

      const cantidadRecibida = roundQuantity(detalleRecepcion.cantidadRecibida);
      if (cantidadRecibida > detalleOrden.props.cantidadPendiente) {
        throw new Error(
          `La cantidad recibida excede el pendiente de la linea ${detalleRecepcion.lineNum}`,
        );
      }

      cantidadesRecibidasPorLinea.set(detalleRecepcion.lineNum, cantidadRecibida);
    }

    await this.unitOfWork.start();

    try {
      const ordenActualizada = new OrdenCompra({
        ...ordenCompra.props,
        estadoId: ordenCompra.props.estadoId,
        detalles: ordenCompra.props.detalles.map((detalle) => {
          const cantidadRecibida = cantidadesRecibidasPorLinea.get(detalle.props.lineNum);
          if (cantidadRecibida == null) {
            return detalle;
          }

          return new OrdenCompraDetalle({
            ...detalle.props,
            cantidadPendiente: roundQuantity(detalle.props.cantidadPendiente - cantidadRecibida),
          });
        }),
      });

      const recepcionInputs = dto.detalles.map((detalleRecepcion) => {
        const detalleOrden = detallesOrdenPorLinea.get(detalleRecepcion.lineNum);
        if (!detalleOrden) {
          throw new Error(`Detalle de orden no encontrado: ${detalleRecepcion.lineNum}`);
        }

        const cantidadRecibida = cantidadesRecibidasPorLinea.get(detalleRecepcion.lineNum);
        if (cantidadRecibida == null) {
          throw new Error(`Detalle de orden no encontrado: ${detalleRecepcion.lineNum}`);
        }

        return {
          detalleOrden,
          cantidadRecibida,
          input: {
            articuloId: detalleOrden.props.articuloId,
            almacenId: detalleOrden.props.almacenId,
            impuestoId: detalleOrden.props.impuestoId,
            descripcion: detalleOrden.props.descripcion,
            cantidadTotal: cantidadRecibida,
            precioUnitario: detalleOrden.props.precioUnitario,
            descuentoLinea: allocateReceiptDiscount(detalleOrden, cantidadRecibida),
          },
        };
      });

      const { detalles, subtotal, descuentoTotal, impuestosTotal, totalDocumento } =
        await buildOrdenCompraDetails(
          recepcionInputs.map((detalle) => detalle.input),
          this.impuestoRepository,
        );

      const recepcion = new OrdenCompra({
        id: crypto.randomUUID(),
        tipoDocId: TIPO_DOCUMENTO_IDS.ENTRADA_MERCADERIA,
        docNum: await this.ordenCompraRepository.nextDocNum(TIPO_DOCUMENTO_IDS.ENTRADA_MERCADERIA),
        proveedorId: ordenCompra.props.proveedorId,
        estadoId: ESTADO_DOCUMENTO_IDS.CERRADO,
        monedaId: ordenCompra.props.monedaId,
        fechaDocumento,
        subtotal,
        descuentoTotal,
        impuestosTotal,
        totalDocumento,
        comentarios:
          dto.comentarios?.trim() || `Recepcion generada desde orden ${ordenCompra.props.docNum}`,
        createdBy: usuarioId,
        detalles: detalles.map(
          (detalle, index) =>
            new OrdenCompraDetalle({
              ...detalle.props,
              cantidadPendiente: 0,
              baseTipoDocId: ordenCompra.props.tipoDocId,
              baseEntry: ordenCompra.props.id,
              baseLine: recepcionInputs[index]?.detalleOrden.props.lineNum,
            }),
        ),
      });

      const ordenFinal = new OrdenCompra({
        ...ordenActualizada.props,
        estadoId: resolveUpdatedOrderStatus(ordenActualizada),
      });

      await this.ordenCompraRepository.save(ordenFinal);
      await this.ordenCompraRepository.save(recepcion);

      for (const detalleRecepcion of recepcionInputs) {
        const stockActual = await this.articuloAlmacenRepository.findByArticuloAndAlmacen(
          detalleRecepcion.detalleOrden.props.articuloId,
          detalleRecepcion.detalleOrden.props.almacenId,
        );

        const stockActualizado = increaseStock(
          stockActual,
          detalleRecepcion.detalleOrden.props.articuloId,
          detalleRecepcion.detalleOrden.props.almacenId,
          detalleRecepcion.cantidadRecibida,
        );

        await this.articuloAlmacenRepository.save(stockActualizado);
        await this.diarioInventarioRepository.save(
          new DiarioInventarioMovimiento({
            id: crypto.randomUUID(),
            articuloId: detalleRecepcion.detalleOrden.props.articuloId,
            almacenId: detalleRecepcion.detalleOrden.props.almacenId,
            docReferenciaId: recepcion.props.id,
            tipoMovimiento: "IN",
            cantidad: detalleRecepcion.cantidadRecibida,
            costoMomento: detalleRecepcion.detalleOrden.props.precioUnitario,
            usuarioId,
            fecha: new Date(),
            comentario: dto.comentarios?.trim() || undefined,
          }),
        );
      }

      if (this.auditoriaEventoRepository) {
        await this.auditoriaEventoRepository.save(
          createAuditoriaEvento({
            usuarioId,
            entidad: "compras_encabezado",
            entidadId: recepcion.props.id,
            accion: "RECEPCIONAR",
            datosDespues: {
              tipoDocId: recepcion.props.tipoDocId,
              docNum: recepcion.props.docNum,
              ordenCompraId: ordenCompra.props.id,
              estadoOrdenCompra: ordenFinal.props.estadoId,
              totalDocumento: recepcion.props.totalDocumento,
              lineas: recepcion.props.detalles.map((detalle) => ({
                articuloId: detalle.props.articuloId,
                almacenId: detalle.props.almacenId,
                cantidadTotal: detalle.props.cantidadTotal,
                baseLine: detalle.props.baseLine,
              })),
            },
          }),
        );
      }

      await this.unitOfWork.commit();

      return {
        ordenCompra: ordenFinal,
        recepcion,
      };
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    } finally {
      await this.unitOfWork.release();
    }
  }
}
