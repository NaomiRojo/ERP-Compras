import type { CrearArticuloDto } from "src/application/dtos/articulo/CrearArticuloDto";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { Articulo } from "src/domain/entities/Articulo";
import type { IArticuloRepository } from "src/domain/repositories/IArticuloRepository";

export class ActualizarArticuloUseCase {
  public constructor(
    private readonly articuloRepository: IArticuloRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(id: string, dto: CrearArticuloDto): Promise<Articulo> {
    const actual = await this.articuloRepository.findById(id);
    if (!actual) {
      throw new Error("Articulo no encontrado");
    }

    await this.unitOfWork.start();

    try {
      const articulo = new Articulo({
        id,
        itemCode: dto.itemCode.trim(),
        itemName: dto.itemName.trim(),
        descripcion: dto.descripcion?.trim() || undefined,
        unidadMedida: dto.unidadMedida?.trim() || "UNI",
        costoEstandar: dto.costoEstandar,
        grupoId: dto.grupoId,
        impuestoId: dto.impuestoId,
        activo: actual.props.activo,
      });

      await this.articuloRepository.save(articulo);
      await this.unitOfWork.commit();
      return articulo;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    } finally {
      await this.unitOfWork.release();
    }
  }
}
