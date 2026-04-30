import type { IProveedorRepository } from "src/domain/repositories/IProveedorRepository";
import type { Proveedor } from "src/domain/entities/Proveedor";

export class ListarProveedoresUseCase {
  public constructor(private readonly proveedorRepository: IProveedorRepository) {}

  public async execute(): Promise<Proveedor[]> {
    return this.proveedorRepository.findAll();
  }
}
