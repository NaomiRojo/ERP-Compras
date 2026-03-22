import type { OrdenCompra } from "src/domain/entities/OrdenCompra";

export interface IOrdenCompraRepository {
  save(ordenCompra: OrdenCompra): Promise<void>;
  findById(id: string): Promise<OrdenCompra | null>;
  findAll(): Promise<OrdenCompra[]>;
  deleteById(id: string): Promise<boolean>;
  nextDocNum(tipoDocId: number): Promise<number>;
}
