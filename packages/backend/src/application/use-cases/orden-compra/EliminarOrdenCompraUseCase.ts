import { ESTADO_DOCUMENTO_IDS } from "src/domain/documentos";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";

export class EliminarOrdenCompraUseCase {
  public constructor(private readonly ordenCompraRepository: IOrdenCompraRepository) {}

  public async execute(id: string): Promise<void> {
    const actual = await this.ordenCompraRepository.findById(id);
    if (!actual) {
      throw new Error("Orden de compra no encontrada");
    }

    if (actual.props.estadoId !== ESTADO_DOCUMENTO_IDS.BORRADOR) {
      throw new Error("Solo se pueden eliminar ordenes en estado BORRADOR");
    }

    const deleted = await this.ordenCompraRepository.deleteById(id);
    if (!deleted) {
      throw new Error("Orden de compra no encontrada");
    }
  }
}
