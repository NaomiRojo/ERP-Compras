export interface IImpuestoRepository {
  findPorcentajeById(id: number): Promise<number | null>;
}
