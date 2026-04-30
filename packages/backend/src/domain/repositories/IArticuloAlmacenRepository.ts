import type { ArticuloAlmacenStock } from "src/domain/entities/ArticuloAlmacenStock";

export interface IArticuloAlmacenRepository {
  findByArticuloAndAlmacen(
    articuloId: string,
    almacenId: string,
  ): Promise<ArticuloAlmacenStock | null>;
  listAll(): Promise<ArticuloAlmacenStock[]>;
  listByArticuloId(articuloId: string): Promise<ArticuloAlmacenStock[]>;
  save(stock: ArticuloAlmacenStock): Promise<void>;
}
