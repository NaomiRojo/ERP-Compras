export interface CrearArticuloDetalleDto {
  itemCode: string;
  itemName: string;
  descripcion?: string;
  unidadMedida?: string;
  costoEstandar: number;
  grupoId: number;
  impuestoId: number;
}

export type CrearArticuloDto = CrearArticuloDetalleDto;
