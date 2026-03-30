import type { ICatalogoRepository } from "src/domain/repositories/ICatalogoRepository";
import type {
  Almacen,
  EstadoDocumento,
  GrupoArticulo,
  Impuesto,
  Moneda,
  RolCatalogo,
  TipoDocumento,
} from "src/domain/entities/Catalogos";

export class CatalogoQueryService {
  public constructor(private readonly catalogoRepository: ICatalogoRepository) {}

  public listarRoles(): Promise<RolCatalogo[]> {
    return this.catalogoRepository.listRoles();
  }

  public listarMonedas(): Promise<Moneda[]> {
    return this.catalogoRepository.listMonedas();
  }

  public listarImpuestos(): Promise<Impuesto[]> {
    return this.catalogoRepository.listImpuestos();
  }

  public listarGruposArticulo(): Promise<GrupoArticulo[]> {
    return this.catalogoRepository.listGruposArticulo();
  }

  public listarAlmacenes(): Promise<Almacen[]> {
    return this.catalogoRepository.listAlmacenes();
  }

  public listarEstadosDocumento(): Promise<EstadoDocumento[]> {
    return this.catalogoRepository.listEstadosDocumento();
  }

  public listarTiposDocumento(): Promise<TipoDocumento[]> {
    return this.catalogoRepository.listTiposDocumento();
  }
}
