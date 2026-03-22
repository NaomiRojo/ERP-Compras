import type { PagoProveedor } from "src/domain/entities/PagoProveedor";

export interface IPagoProveedorRepository {
  save(pago: PagoProveedor): Promise<void>;
  findById(id: string): Promise<PagoProveedor | null>;
}
