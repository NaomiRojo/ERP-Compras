export interface ArticuloAlmacenStockProps {
  id: string;
  articuloId: string;
  almacenId: string;
  stockFisico: number;
  comprometido: number;
  solicitado: number;
  stockDisponible: number;
}

export class ArticuloAlmacenStock {
  public constructor(public readonly props: ArticuloAlmacenStockProps) {}
}
