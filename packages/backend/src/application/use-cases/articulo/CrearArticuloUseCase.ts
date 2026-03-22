import type { CrearArticuloDto } from "src/application/dtos/articulo/CrearArticuloDto";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { Articulo } from "src/domain/entities/Articulo";
import type { IArticuloRepository } from "src/domain/repositories/IArticuloRepository";

export class CrearArticuloUseCase {
  public constructor(
    private readonly articuloRepository: IArticuloRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(dto: CrearArticuloDto): Promise<Articulo> {
    const itemCode = dto.itemCode.trim();
    const itemName = dto.itemName.trim();

    if (!itemCode || !itemName) {
      throw new Error("itemCode e itemName son obligatorios");
    }

    await this.unitOfWork.start();

    try {
      if (await this.articuloRepository.findByItemCode(itemCode)) {
        throw new Error("Ya existe un articulo con ese itemCode");
      }

      const articulo = new Articulo({
        id: crypto.randomUUID(),
        itemCode,
        itemName,
        descripcion: dto.descripcion?.trim() || undefined,
        unidadMedida: dto.unidadMedida?.trim() || "UNI",
        costoEstandar: dto.costoEstandar,
        grupoId: dto.grupoId,
        impuestoId: dto.impuestoId,
        activo: true,
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
