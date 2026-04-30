import type { Proveedor } from "src/domain/entities/Proveedor";

export interface IProveedorRepository {
  save(proveedor: Proveedor): Promise<void>;
  findById(id: string): Promise<Proveedor | null>;
  findByCardCode(cardCode: string): Promise<Proveedor | null>;
  findByNitRut(nitRut: string): Promise<Proveedor | null>;
  findAll(): Promise<Proveedor[]>;
  deleteById(id: string): Promise<boolean>;
}
