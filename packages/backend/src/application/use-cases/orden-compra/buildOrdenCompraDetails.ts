import { OrdenCompraDetalle } from "src/domain/entities/OrdenCompraDetalle";
import type { IImpuestoRepository } from "src/domain/repositories/IImpuestoRepository";

interface OrdenCompraDetalleInput {
  articuloId: string;
  almacenId: string;
  impuestoId: number;
  descripcion?: string;
  cantidadTotal: number;
  precioUnitario: number;
  descuentoLinea?: number;
}

interface OrdenCompraDetailsResult {
  detalles: OrdenCompraDetalle[];
  subtotal: number;
  descuentoTotal: number;
  impuestosTotal: number;
  totalDocumento: number;
}

const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;
const roundQuantity = (value: number): number => Math.round((value + Number.EPSILON) * 10000) / 10000;

export const buildOrdenCompraDetails = async (
  detalleInputs: OrdenCompraDetalleInput[],
  impuestoRepository: IImpuestoRepository,
): Promise<OrdenCompraDetailsResult> => {
  const detalles: OrdenCompraDetalle[] = [];
  let subtotal = 0;
  let descuentoTotal = 0;
  let impuestosTotal = 0;
  let totalDocumento = 0;

  for (const [index, detalle] of detalleInputs.entries()) {
    if (!detalle.articuloId.trim() || !detalle.almacenId.trim()) {
      throw new Error("Cada detalle requiere articuloId y almacenId");
    }

    if (detalle.cantidadTotal <= 0) {
      throw new Error("La cantidadTotal debe ser mayor que cero");
    }

    if (detalle.precioUnitario < 0) {
      throw new Error("El precioUnitario no puede ser negativo");
    }

    const descuentoLinea = roundMoney(detalle.descuentoLinea ?? 0);
    if (descuentoLinea < 0) {
      throw new Error("El descuentoLinea no puede ser negativo");
    }

    const porcentajeImpuesto = await impuestoRepository.findPorcentajeById(detalle.impuestoId);
    if (porcentajeImpuesto == null) {
      throw new Error(`Impuesto no encontrado: ${detalle.impuestoId}`);
    }

    const cantidadTotal = roundQuantity(detalle.cantidadTotal);
    const precioUnitario = roundQuantity(detalle.precioUnitario);
    const subtotalLinea = roundMoney(cantidadTotal * precioUnitario);
    const baseGravable = roundMoney(subtotalLinea - descuentoLinea);

    if (baseGravable < 0) {
      throw new Error("El descuentoLinea no puede superar el subtotal de la linea");
    }

    const impuestoLinea = roundMoney((baseGravable * porcentajeImpuesto) / 100);
    const totalLinea = roundMoney(baseGravable + impuestoLinea);

    detalles.push(
      new OrdenCompraDetalle({
        id: crypto.randomUUID(),
        lineNum: index,
        articuloId: detalle.articuloId,
        almacenId: detalle.almacenId,
        impuestoId: detalle.impuestoId,
        descripcion: detalle.descripcion?.trim() || undefined,
        cantidadTotal,
        cantidadPendiente: cantidadTotal,
        precioUnitario,
        descuentoLinea,
        subtotalLinea,
        totalLinea,
      }),
    );

    subtotal = roundMoney(subtotal + subtotalLinea);
    descuentoTotal = roundMoney(descuentoTotal + descuentoLinea);
    impuestosTotal = roundMoney(impuestosTotal + impuestoLinea);
    totalDocumento = roundMoney(totalDocumento + totalLinea);
  }

  return {
    detalles,
    subtotal,
    descuentoTotal,
    impuestosTotal,
    totalDocumento,
  };
};
