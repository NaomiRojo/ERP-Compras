import type { Articulo } from "src/domain/entities/Articulo";
import type { IArticuloRepository } from "src/domain/repositories/IArticuloRepository";

export class ObtenerArticuloUseCase {
  public constructor(private readonly articuloRepository: IArticuloRepository) {}

  public async execute(id: string): Promise<Articulo> {
    const articulo = await this.articuloRepository.findById(id);
    if (!articulo) {
      throw new Error("Articulo no encontrado");
    }

    return articulo;
  }
}
