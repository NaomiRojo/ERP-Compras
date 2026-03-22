import type { Articulo } from "src/domain/entities/Articulo";

export interface IArticuloRepository {
  save(articulo: Articulo): Promise<void>;
  findById(id: string): Promise<Articulo | null>;
  findByItemCode(itemCode: string): Promise<Articulo | null>;
  findAll(): Promise<Articulo[]>;
  deleteById(id: string): Promise<boolean>;
}
