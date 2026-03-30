export interface RolCatalogoProps {
  id: number;
  codigo: string;
  nombre: string;
}

export class RolCatalogo {
  public constructor(public readonly props: RolCatalogoProps) {}
}

export interface MonedaProps {
  id: number;
  codigo: string;
  nombre: string;
  tasaActual: number;
}

export class Moneda {
  public constructor(public readonly props: MonedaProps) {}
}

export interface ImpuestoProps {
  id: number;
  taxCode: string;
  nombre: string;
  porcentaje: number;
  activo: boolean;
}

export class Impuesto {
  public constructor(public readonly props: ImpuestoProps) {}
}

export interface GrupoArticuloProps {
  id: number;
  codigo: string;
  nombre: string;
}

export class GrupoArticulo {
  public constructor(public readonly props: GrupoArticuloProps) {}
}

export interface AlmacenProps {
  id: string;
  nombre: string;
  ubicacion?: string;
  activo: boolean;
}

export class Almacen {
  public constructor(public readonly props: AlmacenProps) {}
}

export interface EstadoDocumentoProps {
  id: number;
  codigo: string;
  nombre: string;
}

export class EstadoDocumento {
  public constructor(public readonly props: EstadoDocumentoProps) {}
}

export interface TipoDocumentoProps {
  id: number;
  codigo: string;
  nombre: string;
  afectaInventario: boolean;
}

export class TipoDocumento {
  public constructor(public readonly props: TipoDocumentoProps) {}
}
