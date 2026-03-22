export interface CuentaPorPagarProps {
  id: string;
  ordenCompraId: string;
  montoTotal: number;
  saldoPendiente: number;
  fechaVencimiento: Date;
}

export class CuentaPorPagar {
  public constructor(public readonly props: CuentaPorPagarProps) {}
}
