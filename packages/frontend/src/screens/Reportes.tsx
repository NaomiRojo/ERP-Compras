import {
  Box,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";

import { BarChartCard, DonutChartCard, LineChartCard, type ChartPoint } from "../components/Common/Charts";
import { DataTable } from "../components/Common/DataTable";
import { Badge } from "../components/Common/Badge";
import { resolveTone } from "../mocks/data";
import type { AppData } from "../types";

type ReportesScreenProps = {
  data: AppData;
};

const currencyFormatter = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percent = (value: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / total) * 100));
};

const formatMoney = (amount: number): string => `Bs ${currencyFormatter.format(amount)}`;

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = (date: Date): string =>
  date.toLocaleDateString("es-BO", { month: "short" }).replace(".", "");

const buildMonthlySeries = (data: AppData): ChartPoint[] => {
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

  data.ordenes.forEach((orden) => {
    const parsed = new Date(orden.fechaDocumento);
    if (Number.isNaN(parsed.getTime())) {
      return;
    }

    const month = monthByKey.get(monthKey(parsed));
    if (month) {
      month.value += orden.total;
    }
  });

  return months.map(({ label, value }) => ({ label, value }));
};

const buildStockByWarehouse = (data: AppData): ChartPoint[] => {
  const stockByWarehouse = new Map<string, number>();

  data.inventario.forEach((row) => {
    stockByWarehouse.set(row.almacen, (stockByWarehouse.get(row.almacen) ?? 0) + row.disponible);
  });

  return [...stockByWarehouse.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value }));
};

const buildCxpSegments = (data: AppData) =>
  [...data.cxp.reduce((accumulator, cuenta) => {
    accumulator.set(cuenta.estado, (accumulator.get(cuenta.estado) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>()).entries()].map(([label, value]) => ({ label, value }));

export function ReportesScreen({ data }: ReportesScreenProps) {
  const totalCompras = data.ordenes.reduce((total, orden) => total + orden.total, 0);
  const saldoCxp = data.cxp.reduce((total, cuenta) => total + cuenta.saldo, 0);
  const pagosRegistrados = data.pagos.reduce((total, pago) => total + pago.monto, 0);
  const stockDisponible = data.inventario.reduce((total, row) => total + row.disponible, 0);
  const stockComprometido = data.inventario.reduce((total, row) => total + row.comprometido, 0);
  const ordenesAbiertas = data.ordenes.filter((orden) =>
    ["BORRADOR", "APROBADO", "ABIERTO"].includes(orden.estado),
  );
  const cxpVencidas = data.cxp.filter((cuenta) => cuenta.estado === "VENCIDA" || cuenta.saldo > 0);
  const proveedoresTop = [...data.proveedores]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);
  const articulosBajoStock = [...data.inventario]
    .sort((a, b) => a.disponible - b.disponible)
    .slice(0, 8);
  const monthlySeries = buildMonthlySeries(data);
  const stockByWarehouse = buildStockByWarehouse(data);
  const cxpSegments = buildCxpSegments(data);

  const summaries = [
    {
      label: "Compras acumuladas",
      value: formatMoney(totalCompras),
      icon: <ReceiptLongIcon />,
      hint: `${data.ordenes.length} ordenes registradas`,
    },
    {
      label: "Saldo por pagar",
      value: formatMoney(saldoCxp),
      icon: <RequestQuoteIcon />,
      hint: `${data.cxp.filter((cuenta) => cuenta.saldo > 0).length} cuentas con saldo`,
    },
    {
      label: "Pagos registrados",
      value: formatMoney(pagosRegistrados),
      icon: <RequestQuoteIcon />,
      hint: `${data.pagos.length} pagos historicos`,
    },
    {
      label: "Stock disponible",
      value: stockDisponible.toLocaleString("es-BO"),
      icon: <Inventory2Icon />,
      hint: `${stockComprometido.toLocaleString("es-BO")} unidades comprometidas`,
    },
  ];

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { lg: "repeat(4, minmax(0, 1fr))", md: "repeat(2, minmax(0, 1fr))", xs: "1fr" },
        }}
      >
        {summaries.map((summary) => (
          <Box key={summary.label}>
            <Paper sx={{ p: 2.5, height: "100%" }} variant="outlined">
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Chip color="primary" icon={summary.icon} label={summary.label} variant="outlined" />
                </Stack>
                <Typography component="p" variant="h5">
                  {summary.value}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {summary.hint}
                </Typography>
              </Stack>
            </Paper>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { lg: "minmax(0, 1.35fr) minmax(320px, 0.65fr)", xs: "1fr" },
        }}
      >
        <LineChartCard
          description="Evolucion mensual de compras registradas."
          points={monthlySeries}
          title="Compras por mes"
          valuePrefix="Bs "
        />
        <DonutChartCard
          description="Estado financiero de las cuentas por pagar."
          segments={cxpSegments}
          title="Estado de CxP"
        />
      </Box>

      <BarChartCard
        description="Disponibilidad agregada por almacen."
        points={stockByWarehouse}
        title="Stock por almacen"
      />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { md: "repeat(2, minmax(0, 1fr))", xs: "1fr" },
        }}
      >
        <Box>
          <Paper sx={{ p: 2.5, height: "100%" }} variant="outlined">
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ReportProblemIcon fontSize="small" />
                <Typography component="h3" variant="h6">
                  Riesgos operativos
                </Typography>
              </Stack>
              <Divider />
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography>Ordenes abiertas</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{ordenesAbiertas.length}</Typography>
                  </Stack>
                  <LinearProgress value={percent(ordenesAbiertas.length, data.ordenes.length)} variant="determinate" />
                </Box>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography>CxP con saldo</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{cxpVencidas.length}</Typography>
                  </Stack>
                  <LinearProgress color="warning" value={percent(cxpVencidas.length, data.cxp.length)} variant="determinate" />
                </Box>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography>Articulos sin disponible</Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {data.inventario.filter((row) => row.disponible <= 0).length}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    color="error"
                    value={percent(
                      data.inventario.filter((row) => row.disponible <= 0).length,
                      data.inventario.length,
                    )}
                    variant="determinate"
                  />
                </Box>
              </Stack>
            </Stack>
          </Paper>
        </Box>

        <Box>
          <DataTable
            description="Proveedores ordenados por balance de cuenta."
            headers={["Proveedor", "Moneda", "Balance"]}
            rows={proveedoresTop.map((provider) => [
              <strong key={`${provider.id}-name`}>{provider.cardName}</strong>,
              provider.moneda,
              formatMoney(provider.balance),
            ])}
            title="Top proveedores"
          />
        </Box>
      </Box>

      <DataTable
        description="Inventario con menor disponibilidad para seguimiento."
        headers={["SKU", "Articulo", "Almacen", "Disponible", "Comprometido"]}
        rows={articulosBajoStock.map((row) => [
          <strong key={`${row.id}-sku`}>{row.sku}</strong>,
          row.nombre,
          row.almacen,
          row.disponible.toLocaleString("es-BO"),
          row.comprometido.toLocaleString("es-BO"),
        ])}
        title="Stock critico"
      />

      <DataTable
        description="Documentos que requieren aprobacion, recepcion o cierre."
        headers={["Documento", "Proveedor", "Estado", "Total"]}
        rows={ordenesAbiertas.slice(0, 10).map((order) => [
          <strong key={`${order.id}-doc`}>OC-{order.docNum}</strong>,
          order.proveedor,
          <Badge key={`${order.id}-status`} tone={resolveTone(order.estado)}>
            {order.estado}
          </Badge>,
          `${order.moneda} ${currencyFormatter.format(order.total)}`,
        ])}
        title="Ordenes abiertas"
      />
    </Stack>
  );
}
