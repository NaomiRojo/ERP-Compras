import type {
  Almacen,
  EstadoDocumento,
  GrupoArticulo,
  Impuesto,
  Moneda,
  RolCatalogo,
  TipoDocumento,
} from "src/domain/entities/Catalogos";

export interface ICatalogoRepository {
  listRoles(): Promise<RolCatalogo[]>;
  listMonedas(): Promise<Moneda[]>;
  listImpuestos(): Promise<Impuesto[]>;
  listGruposArticulo(): Promise<GrupoArticulo[]>;
  listAlmacenes(): Promise<Almacen[]>;
  listEstadosDocumento(): Promise<EstadoDocumento[]>;
  listTiposDocumento(): Promise<TipoDocumento[]>;
}
