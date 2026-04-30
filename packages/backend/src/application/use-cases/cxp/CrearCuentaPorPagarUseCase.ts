import type { CrearCuentaPorPagarDto } from "src/application/dtos/cxp/CrearCuentaPorPagarDto";
import { ESTADO_DOCUMENTO_IDS } from "src/domain/documentos";
import type { CuentaPorPagar } from "src/domain/entities/CuentaPorPagar";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";
import { CuentasPorPagarService } from "./CuentasPorPagarService";

export class CrearCuentaPorPagarUseCase {
  public constructor(
    private readonly cuentasPorPagarService: CuentasPorPagarService,
    private readonly ordenCompraRepository: IOrdenCompraRepository,
  ) {}

  public async execute(dto: CrearCuentaPorPagarDto, currentUserId: string): Promise<CuentaPorPagar> {
    const compraId = dto.compraId.trim();
    const proveedorId = dto.proveedorId.trim();
    const usuarioId = currentUserId.trim();

    if (!usuarioId) {
      throw new Error("currentUserId es obligatorio");
    }

    const ordenCompra = await this.ordenCompraRepository.findById(compraId);
    if (!ordenCompra) {
      throw new Error("Orden de compra no encontrada");
    }

    if (ordenCompra.props.estadoId === ESTADO_DOCUMENTO_IDS.BORRADOR) {
      throw new Error("La cuenta por pagar requiere una orden aprobada o recibida");
    }

    if (ordenCompra.props.proveedorId !== proveedorId) {
      throw new Error("El proveedor no coincide con la orden de compra");
    }

    return this.cuentasPorPagarService.crearCuentaPorPagar(dto, usuarioId);
  }
}
