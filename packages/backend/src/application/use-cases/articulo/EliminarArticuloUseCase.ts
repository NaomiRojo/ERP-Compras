import type { IArticuloRepository } from "src/domain/repositories/IArticuloRepository";

export class EliminarArticuloUseCase {
  public constructor(private readonly articuloRepository: IArticuloRepository) {}

  public async execute(id: string): Promise<void> {
    const deleted = await this.articuloRepository.deleteById(id);
    if (!deleted) {
      throw new Error("Articulo no encontrado");
    }
  }
}
