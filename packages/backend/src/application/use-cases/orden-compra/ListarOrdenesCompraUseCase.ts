import type { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";

export class ListarOrdenesCompraUseCase {
  public constructor(private readonly ordenCompraRepository: IOrdenCompraRepository) {}

  public async execute(): Promise<OrdenCompra[]> {
    return this.ordenCompraRepository.findAll();
  }
}
