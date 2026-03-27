import type { ActualizarOrdenCompraDto } from "src/application/dtos/orden-compra/ActualizarOrdenCompraDto";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { IImpuestoRepository } from "src/domain/repositories/IImpuestoRepository";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";
import { buildOrdenCompraDetails } from "./buildOrdenCompraDetails";

export class ActualizarOrdenCompraUseCase {
  public constructor(
    private readonly ordenCompraRepository: IOrdenCompraRepository,
    private readonly impuestoRepository: IImpuestoRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(id: string, dto: ActualizarOrdenCompraDto, _currentUserId: string): Promise<OrdenCompra> {
    const actual = await this.ordenCompraRepository.findById(id);
    if (!actual) {
      throw new Error("Orden de compra no encontrada");
    }

    await this.unitOfWork.start();

    try {
      const { detalles, subtotal, descuentoTotal, impuestosTotal, totalDocumento } =
        await buildOrdenCompraDetails(dto.detalles, this.impuestoRepository);

      const ordenCompra = new OrdenCompra({
        id,
        tipoDocId: actual.props.tipoDocId,
        docNum: actual.props.docNum,
        proveedorId: dto.proveedorId,
        estadoId: actual.props.estadoId,
        monedaId: dto.monedaId,
        fechaDocumento: new Date(dto.fechaDocumento),
        fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : undefined,
        subtotal,
        descuentoTotal,
        impuestosTotal,
        totalDocumento,
        comentarios: dto.comentarios?.trim() || undefined,
        createdBy: actual.props.createdBy,
        approvedBy: actual.props.approvedBy,
        detalles,
      });

      await this.ordenCompraRepository.save(ordenCompra);
      await this.unitOfWork.commit();
      return ordenCompra;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    } finally {
      await this.unitOfWork.release();
    }
  }
}
