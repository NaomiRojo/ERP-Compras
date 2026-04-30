import type { CuentaPorPagar } from "src/domain/entities/CuentaPorPagar";

export interface ICuentaPorPagarRepository {
  findById(id: string): Promise<CuentaPorPagar | null>;
  findByProveedorAndNumeroFactura(
    proveedorId: string,
    numeroFactura: string,
  ): Promise<CuentaPorPagar | null>;
  listAll(): Promise<CuentaPorPagar[]>;
  save(cuentaPorPagar: CuentaPorPagar): Promise<void>;
}
