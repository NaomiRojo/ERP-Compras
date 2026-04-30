export interface ArticuloProps {
  id: string;
  itemCode: string;
  itemName: string;
  descripcion?: string;
  unidadMedida: string;
  costoEstandar: number;
  grupoId: number;
  impuestoId: number;
  activo: boolean;
}

export class Articulo {
  public constructor(public readonly props: ArticuloProps) {}
}
