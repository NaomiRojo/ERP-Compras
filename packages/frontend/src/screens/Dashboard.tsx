import { Alert, Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { BarChartCard, DonutChartCard, LineChartCard, type ChartPoint } from "../components/Common/Charts";
import { DataTable } from "../components/Common/DataTable";
import { KpiGrid } from "../components/Common/KpiGrid";
import { Badge } from "../components/Common/Badge";
import { resolveTone } from "../mocks/data";
import type { AccountsPayable, InventoryRow, Metric, Order, Payment } from "../types";

type DashboardScreenProps = {
  cuentas: AccountsPayable[];
  inventario: InventoryRow[];
  metrics: Metric[];
  ordenes: Order[];
  pagos: Payment[];
};

const moneyFormatter = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const isOpenOrder = (order: Order): boolean =>
  ["BORRADOR", "APROBADO", "ABIERTO"].includes(order.estado);

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = (date: Date): string =>
  date.toLocaleDateString("es-BO", { month: "short" }).replace(".", "");

const buildMonthlyPurchaseSeries = (orders: Order[]): ChartPoint[] => {
  const today = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
    return {
      key: monthKey(date),
      label: monthLabel(date),
      value: 0,
    };
  });
  const monthByKey = new Map(months.map((month) => [month.key, month]));

  for (const order of orders) {
    const parsed = new Date(order.fechaDocumento);
    if (Number.isNaN(parsed.getTime())) {
      continue;
    }

    const currentMonth = monthByKey.get(monthKey(parsed));
    if (currentMonth) {
      currentMonth.value += order.total;
    }
  }

  return months.map(({ label, value }) => ({ label, value }));
};

const buildProviderSpendSeries = (orders: Order[]): ChartPoint[] => {
  const totals = new Map<string, number>();

  for (const order of orders) {
    totals.set(order.proveedor, (totals.get(order.proveedor) ?? 0) + order.total);
  }

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));
};

const buildStatusSegments = (orders: Order[]) =>
  [...orders.reduce((accumulator, order) => {
    accumulator.set(order.estado, (accumulator.get(order.estado) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>()).entries()].map(([label, value]) => ({ label, value }));

export function DashboardScreen({
  cuentas,
  inventario,
  metrics,
  ordenes,
  pagos,
}: DashboardScreenProps) {
  const openOrders = ordenes.filter(isOpenOrder);
  const pendingPayments = cuentas.filter((cuenta) => cuenta.saldo > 0);
  const lowStockRows = inventario.filter((row) => row.disponible <= 0);
  const totalOpenAmount = openOrders.reduce((total, order) => total + order.total, 0);
  const pendingBalance = pendingPayments.reduce((total, cuenta) => total + cuenta.saldo, 0);
  const paidAmount = pagos.reduce((total, pago) => total + pago.monto, 0);
  const monthlyPurchases = buildMonthlyPurchaseSeries(ordenes);
  const providerSpend = buildProviderSpendSeries(ordenes);
  const statusSegments = buildStatusSegments(ordenes);

  return (
    <Stack spacing={3}>
      <KpiGrid metrics={metrics} />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { md: "repeat(3, minmax(0, 1fr))", xs: "1fr" },
        }}
      >
        <Box>
          <Paper sx={{ p: 2.5, height: "100%" }} variant="outlined">
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <AccessTimeIcon fontSize="small" />
                <Typography component="h3" variant="h6">
                  Ordenes abiertas
                </Typography>
              </Stack>
              <Typography component="p" variant="h4">
                {openOrders.length}
              </Typography>
              <Typography color="text.secondary">
                {`Monto comprometido Bs ${moneyFormatter.format(totalOpenAmount)}`}
              </Typography>
              <LinearProgress value={ordenes.length ? (openOrders.length / ordenes.length) * 100 : 0} variant="determinate" />
            </Stack>
          </Paper>
        </Box>
        <Box>
          <Paper sx={{ p: 2.5, height: "100%" }} variant="outlined">
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ReceiptLongIcon fontSize="small" />
                <Typography component="h3" variant="h6">
                  Pendiente por pagar
                </Typography>
              </Stack>
              <Typography component="p" variant="h4">
                {pendingPayments.length}
              </Typography>
              <Typography color="text.secondary">
                {`Saldo Bs ${moneyFormatter.format(pendingBalance)}`}
              </Typography>
              <LinearProgress color="warning" value={cuentas.length ? (pendingPayments.length / cuentas.length) * 100 : 0} variant="determinate" />
            </Stack>
          </Paper>
        </Box>
        <Box>
          <Paper sx={{ p: 2.5, height: "100%" }} variant="outlined">
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Inventory2Icon fontSize="small" />
                <Typography component="h3" variant="h6">
                  Stock sin disponible
                </Typography>
              </Stack>
              <Typography component="p" variant="h4">
                {lowStockRows.length}
              </Typography>
              <Typography color="text.secondary">
                {`Pagado historico Bs ${moneyFormatter.format(paidAmount)}`}
              </Typography>
              <LinearProgress color="error" value={inventario.length ? (lowStockRows.length / inventario.length) * 100 : 0} variant="determinate" />
            </Stack>
          </Paper>
        </Box>
      </Box>

      {lowStockRows.length > 0 ? (
        <Alert severity="warning">
          Hay {lowStockRows.length} articulo(s) sin stock disponible. Revisa inventario antes de nuevas compras.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { lg: "minmax(0, 1.35fr) minmax(320px, 0.65fr)", xs: "1fr" },
        }}
      >
        <LineChartCard
          description="Monto comprado por mes segun ordenes de compra."
          points={monthlyPurchases}
          title="Tendencia de compras"
          valuePrefix="Bs "
        />
        <DonutChartCard
          description="Distribucion de documentos por estado operativo."
          segments={statusSegments}
          title="Estados de ordenes"
        />
      </Box>

      <BarChartCard
        description="Concentracion de compras por proveedor."
        points={providerSpend}
        title="Gasto por proveedor"
        valuePrefix="Bs "
      />

      <DataTable
        title="Ordenes criticas"
        description="Resumen de documentos mas relevantes."
        headers={["Documento", "Proveedor", "Estado", "Monto"]}
        rows={openOrders.slice(0, 8).map((order) => [
          <strong key={`${order.id}-doc`}>OC-{order.docNum}</strong>,
          order.proveedor,
          <Badge key={`${order.id}-status`} tone={resolveTone(order.estado)}>
            {order.estado}
          </Badge>,
          `${order.moneda} ${moneyFormatter.format(order.total)}`,
        ])}
      />
    </Stack>
  );
}
