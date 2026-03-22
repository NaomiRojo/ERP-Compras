import type { ActualizarOrdenCompraDto } from "src/application/dtos/orden-compra/ActualizarOrdenCompraDto";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import { OrdenCompraDetalle } from "src/domain/entities/OrdenCompraDetalle";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";

export class ActualizarOrdenCompraUseCase {
  public constructor(
    private readonly ordenCompraRepository: IOrdenCompraRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(id: string, dto: ActualizarOrdenCompraDto, currentUserId: string): Promise<OrdenCompra> {
    const actual = await this.ordenCompraRepository.findById(id);
    if (!actual) {
      throw new Error("Orden de compra no encontrada");
    }

    await this.unitOfWork.start();

    try {
      const detalles = dto.detalles.map((detalle, index) => {
        const descuentoLinea = detalle.descuentoLinea ?? 0;
        const subtotalLinea = detalle.cantidadTotal * detalle.precioUnitario;
        const totalLinea = subtotalLinea - descuentoLinea;

        return new OrdenCompraDetalle({
          id: crypto.randomUUID(),
          lineNum: index,
          articuloId: detalle.articuloId,
          almacenId: detalle.almacenId,
          impuestoId: detalle.impuestoId,
          descripcion: detalle.descripcion?.trim() || undefined,
          cantidadTotal: detalle.cantidadTotal,
          cantidadPendiente: detalle.cantidadTotal,
          precioUnitario: detalle.precioUnitario,
          descuentoLinea,
          subtotalLinea,
          totalLinea,
        });
      });

      const subtotal = detalles.reduce((sum, item) => sum + item.props.subtotalLinea, 0);
      const descuentoTotal = detalles.reduce((sum, item) => sum + item.props.descuentoLinea, 0);
      const totalDocumento = detalles.reduce((sum, item) => sum + item.props.totalLinea, 0);

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
        impuestosTotal: 0,
        totalDocumento,
        comentarios: dto.comentarios?.trim() || undefined,
        createdBy: currentUserId,
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
