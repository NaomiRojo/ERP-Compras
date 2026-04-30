import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { ESTADO_DOCUMENTO_IDS } from "src/domain/documentos";
import { createAuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { IAuditoriaEventoRepository } from "src/domain/repositories/IAuditoriaEventoRepository";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";

export class AprobarOrdenCompraUseCase {
  public constructor(
    private readonly ordenCompraRepository: IOrdenCompraRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly auditoriaEventoRepository?: IAuditoriaEventoRepository,
  ) {}

  public async execute(id: string, currentUserId: string): Promise<OrdenCompra> {
    const ordenCompraId = id.trim();
    const aprobadorId = currentUserId.trim();

    if (!ordenCompraId) {
      throw new Error("id es obligatorio");
    }

    if (!aprobadorId) {
      throw new Error("currentUserId es obligatorio");
    }

    const actual = await this.ordenCompraRepository.findById(ordenCompraId);
    if (!actual) {
      throw new Error("Orden de compra no encontrada");
    }

    if (actual.props.estadoId === ESTADO_DOCUMENTO_IDS.APROBADO || actual.props.approvedBy) {
      throw new Error("La orden de compra ya fue aprobada");
    }

    if (actual.props.estadoId !== ESTADO_DOCUMENTO_IDS.BORRADOR) {
      throw new Error("Solo se pueden aprobar ordenes en estado BORRADOR");
    }

    await this.unitOfWork.start();

    try {
      const aprobada = new OrdenCompra({
        ...actual.props,
        estadoId: ESTADO_DOCUMENTO_IDS.APROBADO,
        approvedBy: aprobadorId,
      });

      await this.ordenCompraRepository.save(aprobada);

      if (this.auditoriaEventoRepository) {
        await this.auditoriaEventoRepository.save(
          createAuditoriaEvento({
            usuarioId: aprobadorId,
            entidad: "compras_encabezado",
            entidadId: aprobada.props.id,
            accion: "APROBAR",
            datosAntes: {
              estadoId: actual.props.estadoId,
              approvedBy: actual.props.approvedBy,
            },
            datosDespues: {
              estadoId: aprobada.props.estadoId,
              approvedBy: aprobada.props.approvedBy,
            },
          }),
        );
      }

      await this.unitOfWork.commit();

      return aprobada;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    } finally {
      await this.unitOfWork.release();
    }
  }
}
