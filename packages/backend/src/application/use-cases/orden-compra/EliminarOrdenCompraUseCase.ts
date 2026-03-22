import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";

export class EliminarOrdenCompraUseCase {
  public constructor(private readonly ordenCompraRepository: IOrdenCompraRepository) {}

  public async execute(id: string): Promise<void> {
    const deleted = await this.ordenCompraRepository.deleteById(id);
    if (!deleted) {
      throw new Error("Orden de compra no encontrada");
    }
  }
}
