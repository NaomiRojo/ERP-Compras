import type { CrearOrdenCompraDto } from "src/application/dtos/orden-compra/CrearOrdenCompraDto";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { ESTADO_DOCUMENTO_IDS, TIPO_DOCUMENTO_IDS } from "src/domain/documentos";
import { createAuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { IAuditoriaEventoRepository } from "src/domain/repositories/IAuditoriaEventoRepository";
import type { IImpuestoRepository } from "src/domain/repositories/IImpuestoRepository";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";
import { buildOrdenCompraDetails } from "./buildOrdenCompraDetails";

export class CrearOrdenCompraUseCase {
  public constructor(
    private readonly ordenCompraRepository: IOrdenCompraRepository,
    private readonly impuestoRepository: IImpuestoRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly auditoriaEventoRepository?: IAuditoriaEventoRepository,
  ) {}

  public async execute(dto: CrearOrdenCompraDto, currentUserId: string): Promise<OrdenCompra> {
    if (!dto.proveedorId.trim() || dto.detalles.length === 0) {
      throw new Error("proveedorId y detalles son obligatorios");
    }

    await this.unitOfWork.start();

    try {
      const docNum = await this.ordenCompraRepository.nextDocNum(TIPO_DOCUMENTO_IDS.PEDIDO_COMPRA);
      const { detalles, subtotal, descuentoTotal, impuestosTotal, totalDocumento } =
        await buildOrdenCompraDetails(dto.detalles, this.impuestoRepository);

      const ordenCompra = new OrdenCompra({
        id: crypto.randomUUID(),
        tipoDocId: TIPO_DOCUMENTO_IDS.PEDIDO_COMPRA,
        docNum,
        proveedorId: dto.proveedorId,
        estadoId: ESTADO_DOCUMENTO_IDS.BORRADOR,
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

      if (this.auditoriaEventoRepository) {
        await this.auditoriaEventoRepository.save(
          createAuditoriaEvento({
            usuarioId: currentUserId,
            entidad: "compras_encabezado",
            entidadId: ordenCompra.props.id,
            accion: "CREAR",
            datosDespues: {
              tipoDocId: ordenCompra.props.tipoDocId,
              docNum: ordenCompra.props.docNum,
              proveedorId: ordenCompra.props.proveedorId,
              estadoId: ordenCompra.props.estadoId,
              totalDocumento: ordenCompra.props.totalDocumento,
            },
          }),
        );
      }

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
