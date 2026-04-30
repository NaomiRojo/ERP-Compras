import type { IProveedorRepository } from "src/domain/repositories/IProveedorRepository";

export class EliminarProveedorUseCase {
  public constructor(private readonly proveedorRepository: IProveedorRepository) {}

  public async execute(id: string): Promise<void> {
    const deleted = await this.proveedorRepository.deleteById(id);
    if (!deleted) {
      throw new Error("Proveedor no encontrado");
    }
  }
}
