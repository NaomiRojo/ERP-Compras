import type { IProveedorRepository } from "src/domain/repositories/IProveedorRepository";
import type { Proveedor } from "src/domain/entities/Proveedor";

export class ObtenerProveedorUseCase {
  public constructor(private readonly proveedorRepository: IProveedorRepository) {}

  public async execute(id: string): Promise<Proveedor> {
    const proveedor = await this.proveedorRepository.findById(id);
    if (!proveedor) {
      throw new Error("Proveedor no encontrado");
    }

    return proveedor;
  }
}
