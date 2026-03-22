import type { CrearOrdenCompraDto } from "src/application/dtos/orden-compra/CrearOrdenCompraDto";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import { OrdenCompraDetalle } from "src/domain/entities/OrdenCompraDetalle";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";

export class CrearOrdenCompraUseCase {
  public constructor(
    private readonly ordenCompraRepository: IOrdenCompraRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(dto: CrearOrdenCompraDto, currentUserId: string): Promise<OrdenCompra> {
    if (!dto.proveedorId.trim() || dto.detalles.length === 0) {
      throw new Error("proveedorId y detalles son obligatorios");
    }

    await this.unitOfWork.start();

    try {
      const docNum = await this.ordenCompraRepository.nextDocNum(2);
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
        id: crypto.randomUUID(),
        tipoDocId: 2,
        docNum,
        proveedorId: dto.proveedorId,
        estadoId: 1,
        monedaId: dto.monedaId,
        fechaDocumento: new Date(dto.fechaDocumento),
        fechaVencimiento: dto.fechaVencimiento ? new Date(dto.fechaVencimiento) : undefined,
        subtotal,
        descuentoTotal,
        impuestosTotal: 0,
        totalDocumento,
        comentarios: dto.comentarios?.trim() || undefined,
        createdBy: currentUserId,
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
