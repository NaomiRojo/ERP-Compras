import type { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";

export class ObtenerOrdenCompraUseCase {
  public constructor(private readonly ordenCompraRepository: IOrdenCompraRepository) {}

  public async execute(id: string): Promise<OrdenCompra> {
    const ordenCompra = await this.ordenCompraRepository.findById(id);
    if (!ordenCompra) {
      throw new Error("Orden de compra no encontrada");
    }

    return ordenCompra;
  }
}
