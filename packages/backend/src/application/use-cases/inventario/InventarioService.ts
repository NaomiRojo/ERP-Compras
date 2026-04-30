import type { RegistrarMovimientoInventarioDto } from "src/application/dtos/inventario/RegistrarMovimientoInventarioDto";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { ArticuloAlmacenStock } from "src/domain/entities/ArticuloAlmacenStock";
import {
  DiarioInventarioMovimiento,
  type TipoMovimientoInventario,
} from "src/domain/entities/DiarioInventarioMovimiento";
import { createAuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import type { IArticuloAlmacenRepository } from "src/domain/repositories/IArticuloAlmacenRepository";
import type { IAuditoriaEventoRepository } from "src/domain/repositories/IAuditoriaEventoRepository";
import type { IDiarioInventarioRepository } from "src/domain/repositories/IDiarioInventarioRepository";

const applyMovimiento = (
  actual: ArticuloAlmacenStock | null,
  tipoMovimiento: TipoMovimientoInventario,
  cantidad: number,
): ArticuloAlmacenStock => {
  const stockFisicoActual = actual?.props.stockFisico ?? 0;
  const comprometido = actual?.props.comprometido ?? 0;
  const solicitado = actual?.props.solicitado ?? 0;
  const stockDisponibleActual = actual?.props.stockDisponible ?? 0;
  const delta = tipoMovimiento === "IN" ? cantidad : -cantidad;
  const stockFisico = stockFisicoActual + delta;
  const stockDisponible = stockDisponibleActual + delta;

  if (stockFisico < 0 || stockDisponible < 0) {
    throw new Error("El movimiento dejaria stock negativo");
  }

  return new ArticuloAlmacenStock({
    id: actual?.props.id ?? crypto.randomUUID(),
    articuloId: actual?.props.articuloId ?? "",
    almacenId: actual?.props.almacenId ?? "",
    stockFisico,
    comprometido,
    solicitado,
    stockDisponible,
  });
};

export class InventarioService {
  public constructor(
    private readonly articuloAlmacenRepository: IArticuloAlmacenRepository,
    private readonly diarioInventarioRepository: IDiarioInventarioRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly auditoriaEventoRepository?: IAuditoriaEventoRepository,
  ) {}

  public listarStocks(): Promise<ArticuloAlmacenStock[]> {
    return this.articuloAlmacenRepository.listAll();
  }

  public listarStocksPorArticulo(articuloId: string): Promise<ArticuloAlmacenStock[]> {
    const articuloIdNormalizado = articuloId.trim();
    if (!articuloIdNormalizado) {
      throw new Error("articuloId es obligatorio");
    }

    return this.articuloAlmacenRepository.listByArticuloId(articuloIdNormalizado);
  }

  public listarMovimientos(): Promise<DiarioInventarioMovimiento[]> {
    return this.diarioInventarioRepository.listAll();
  }

  public async obtenerMovimiento(id: string): Promise<DiarioInventarioMovimiento> {
    const movimientoId = id.trim();
    if (!movimientoId) {
      throw new Error("id es obligatorio");
    }

    const movimiento = await this.diarioInventarioRepository.findById(movimientoId);
    if (!movimiento) {
      throw new Error("Movimiento de inventario no encontrado");
    }

    return movimiento;
  }

  public async registrarMovimiento(
    dto: RegistrarMovimientoInventarioDto,
    currentUserId: string,
  ): Promise<DiarioInventarioMovimiento> {
    const articuloId = dto.articuloId.trim();
    const almacenId = dto.almacenId.trim();
    const docReferenciaId = dto.docReferenciaId.trim();

    if (!articuloId || !almacenId || !docReferenciaId) {
      throw new Error("articuloId, almacenId y docReferenciaId son obligatorios");
    }

    if (!["IN", "OUT"].includes(dto.tipoMovimiento)) {
      throw new Error("tipoMovimiento invalido");
    }

    if (dto.cantidad <= 0 || dto.costoMomento < 0) {
      throw new Error("cantidad y costoMomento deben ser validos");
    }

    await this.unitOfWork.start();

    try {
      const actual = await this.articuloAlmacenRepository.findByArticuloAndAlmacen(
        articuloId,
        almacenId,
      );
      const actualizado = applyMovimiento(actual, dto.tipoMovimiento, dto.cantidad);
      const stock = new ArticuloAlmacenStock({
        ...actualizado.props,
        articuloId,
        almacenId,
      });

      const movimiento = new DiarioInventarioMovimiento({
        id: crypto.randomUUID(),
        articuloId,
        almacenId,
        docReferenciaId,
        tipoMovimiento: dto.tipoMovimiento,
        cantidad: dto.cantidad,
        costoMomento: dto.costoMomento,
        usuarioId: currentUserId,
        fecha: new Date(),
        comentario: dto.comentario?.trim() || undefined,
      });

      await this.articuloAlmacenRepository.save(stock);
      await this.diarioInventarioRepository.save(movimiento);

      if (this.auditoriaEventoRepository) {
        await this.auditoriaEventoRepository.save(
          createAuditoriaEvento({
            usuarioId: currentUserId,
            entidad: "diario_inventario",
            entidadId: movimiento.props.id,
            accion: "CREAR",
            datosDespues: {
              articuloId,
              almacenId,
              tipoMovimiento: dto.tipoMovimiento,
              cantidad: dto.cantidad,
              stockFisico: stock.props.stockFisico,
              stockDisponible: stock.props.stockDisponible,
            },
          }),
        );
      }

      await this.unitOfWork.commit();
      return movimiento;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    } finally {
      await this.unitOfWork.release();
    }
  }
}
