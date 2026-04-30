import type { Articulo } from "src/domain/entities/Articulo";
import type { IArticuloRepository } from "src/domain/repositories/IArticuloRepository";

export class ListarArticulosUseCase {
  public constructor(private readonly articuloRepository: IArticuloRepository) {}

  public async execute(): Promise<Articulo[]> {
    return this.articuloRepository.findAll();
  }
}
