import type { PagoProveedor } from "src/domain/entities/PagoProveedor";

export interface IPagoProveedorRepository {
  findById(id: string): Promise<PagoProveedor | null>;
  listAll(): Promise<PagoProveedor[]>;
  save(pago: PagoProveedor): Promise<void>;
}
