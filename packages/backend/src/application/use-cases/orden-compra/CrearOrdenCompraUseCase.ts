import type { CrearOrdenCompraDto } from "src/application/dtos/orden-compra/CrearOrdenCompraDto";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { IImpuestoRepository } from "src/domain/repositories/IImpuestoRepository";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";
import { buildOrdenCompraDetails } from "./buildOrdenCompraDetails";

export class CrearOrdenCompraUseCase {
  public constructor(
    private readonly ordenCompraRepository: IOrdenCompraRepository,
    private readonly impuestoRepository: IImpuestoRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(dto: CrearOrdenCompraDto, currentUserId: string): Promise<OrdenCompra> {
    if (!dto.proveedorId.trim() || dto.detalles.length === 0) {
      throw new Error("proveedorId y detalles son obligatorios");
    }

    await this.unitOfWork.start();

    try {
      const docNum = await this.ordenCompraRepository.nextDocNum(2);
      const { detalles, subtotal, descuentoTotal, impuestosTotal, totalDocumento } =
        await buildOrdenCompraDetails(dto.detalles, this.impuestoRepository);

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
        impuestosTotal,
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
