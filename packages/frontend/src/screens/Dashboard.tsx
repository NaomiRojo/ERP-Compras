import { DataTable } from "../components/Common/DataTable";
import { KpiGrid } from "../components/Common/KpiGrid";
import { Badge } from "../components/Common/Badge";
import { resolveTone } from "../mocks/data";
import type { Metric, Order } from "../types";

type DashboardScreenProps = {
  metrics: Metric[];
  ordenes: Order[];
};

export function DashboardScreen({ metrics, ordenes }: DashboardScreenProps) {
  return (
    <div className="stack">
      <KpiGrid metrics={metrics} />
      <DataTable
        title="Ordenes criticas"
        description="Resumen de documentos mas relevantes."
        headers={["Documento", "Proveedor", "Estado", "Monto"]}
        rows={ordenes.slice(0, 8).map((order) => [
          <strong key={`${order.id}-doc`}>OC-{order.docNum}</strong>,
          order.proveedor,
          <Badge key={`${order.id}-status`} tone={resolveTone(order.estado)}>
            {order.estado}
          </Badge>,
          `${order.moneda} ${order.total.toLocaleString()}`,
        ])}
      />
    </div>
  );
}
