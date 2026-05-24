import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import HistoryIcon from "@mui/icons-material/History";

import { DonutChartCard, type ChartPoint, type DonutSegment } from "../components/Common/Charts";
import { DataTable } from "../components/Common/DataTable";
import { Badge } from "../components/Common/Badge";
import { resolveTone } from "../mocks/data";
import { buildViewPath } from "../router/views";
import type { AccountsPayable, AuditRow, BadgeTone, InventoryRow, Metric, Order, OrderLine, Payment } from "../types";

type DashboardScreenProps = {
  auditoria: AuditRow[];
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

const compactMoneyFormatter = new Intl.NumberFormat("es-BO", {
  maximumFractionDigits: 1,
  notation: "compact",
});

const percentageFormatter = new Intl.NumberFormat("es-BO", {
  maximumFractionDigits: 0,
});

const OPEN_ORDER_STATUSES = new Set([
  "ABIERTO",
  "APROBADO",
  "BORRADOR",
  "PENDIENTE",
  "PARCIAL",
]);

const CLOSED_ORDER_STATUSES = new Set([
  "ANULADO",
  "CANCELADO",
  "CERRADO",
  "RECHAZADO",
]);

const CATEGORY_RULES: Array<{ label: string; pattern: RegExp }> = [
  { label: "Servicios", pattern: /(servic|consult|manten|soporte|capacit)/i },
  { label: "Logistica", pattern: /(flete|transpor|logist|envio)/i },
  { label: "Oficina", pattern: /(oficina|papel|toner|impres|mueble)/i },
  { label: "Materiales", pattern: /(insumo|material|acero|metal|herramient|equipo)/i },
];

const normalizeStatus = (status: string): string => status.trim().toUpperCase();

const isOpenOrder = (order: Order): boolean => {
  const normalized = normalizeStatus(order.estado);
  if (OPEN_ORDER_STATUSES.has(normalized)) {
    return true;
  }

  return !CLOSED_ORDER_STATUSES.has(normalized);
};

const getAuditTone = (action: string): BadgeTone => {
  const normalizedAction = action.toLowerCase();

  if (normalizedAction.includes("cre") || normalizedAction.includes("insert")) {
    return "success";
  }

  if (normalizedAction.includes("edit") || normalizedAction.includes("updat") || normalizedAction.includes("mod")) {
    return "info";
  }

  if (normalizedAction.includes("delete") || normalizedAction.includes("elim") || normalizedAction.includes("anul")) {
    return "warning";
  }

  return "neutral";
};

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = (date: Date): string =>
  date.toLocaleDateString("es-BO", { month: "short" }).replace(".", "");

const parseDate = (value?: string): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

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

const buildProviderSpendSegments = (orders: Order[]): DonutSegment[] => {
  const totals = new Map<string, number>();

  for (const order of orders) {
    totals.set(order.proveedor, (totals.get(order.proveedor) ?? 0) + order.total);
  }

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value: Math.round(value) }));
};

const buildStatusSegments = (orders: Order[]) =>
  [...orders.reduce((accumulator, order) => {
    accumulator.set(order.estado, (accumulator.get(order.estado) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>()).entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

const resolveLineAmount = (line: OrderLine): number => {
  if (line.lineTotal > 0) {
    return line.lineTotal;
  }

  return line.qty * line.price * (1 - line.discount / 100);
};

const resolveLineCategory = (line: OrderLine): string => {
  const probe = `${line.description} ${line.sku}`;
  const matched = CATEGORY_RULES.find((rule) => rule.pattern.test(probe));
  return matched?.label ?? "Materiales";
};

const buildCategorySpendSegments = (orders: Order[]): DonutSegment[] => {
  const totals = new Map<string, number>([
    ["Materiales", 0],
    ["Servicios", 0],
    ["Oficina", 0],
    ["Logistica", 0],
  ]);

  for (const order of orders) {
    for (const line of order.lines) {
      const category = resolveLineCategory(line);
      totals.set(category, (totals.get(category) ?? 0) + resolveLineAmount(line));
    }
  }

  const segments = [...totals.entries()]
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value: Math.round(value) }));

  if (segments.length > 0) {
    return segments;
  }

  return buildProviderSpendSegments(orders);
};

const parseMetricNumber = (value: string): number | null => {
  const digits = value.replace(/\D+/g, "");
  if (!digits) {
    return null;
  }

  return Number(digits);
};

const resolveActiveProviderCount = (metrics: Metric[], orders: Order[]): number => {
  const providerMetric = metrics.find((metric) =>
    metric.label.toLowerCase().includes("proveedor"),
  );
  const metricValue = providerMetric ? parseMetricNumber(providerMetric.value) : null;

  if (metricValue !== null) {
    return metricValue;
  }

  const providerIds = new Set(
    orders.map((order) => order.proveedorId || order.proveedor).filter((value) => value.length > 0),
  );
  return providerIds.size;
};

const resolveDelayedByProvider = (orders: Order[]): string | null => {
  const delayedByProvider = orders.reduce((accumulator, order) => {
    accumulator.set(order.proveedor, (accumulator.get(order.proveedor) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>());
  const [provider, count] = [...delayedByProvider.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];

  if (!provider || !count) {
    return null;
  }

  return `${provider} concentra ${count} OC atrasadas.`;
};

const formatCompactMoney = (value: number): string =>
  compactMoneyFormatter.format(value);

type MonthlySpendBarsCardProps = {
  points: ChartPoint[];
  valuePrefix: string;
};

function MonthlySpendBarsCard({ points, valuePrefix }: MonthlySpendBarsCardProps) {
  const maximum = Math.max(1, ...points.map((point) => point.value));
  const hasData = points.some((point) => point.value > 0);

  return (
    <Paper
      sx={{
        borderColor: "rgba(20, 32, 51, 0.08)",
        height: "100%",
        p: 2.5,
      }}
      variant="outlined"
    >
      <Stack spacing={2}>
        <Box>
          <Typography component="h3" sx={{ fontWeight: 850 }} variant="h6">
            Tendencia de gasto mensual
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Ultimos 6 meses de ordenes de compra.
          </Typography>
        </Box>
        <Box
          sx={{
            alignItems: "end",
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            minHeight: 220,
          }}
        >
          {points.map((point) => {
            const normalizedHeight = hasData ? Math.max(8, (point.value / maximum) * 150) : 8;

            return (
              <Stack key={point.label} spacing={0.5} sx={{ alignItems: "center" }}>
                <Box sx={{ alignItems: "end", display: "flex", height: 160, width: "100%" }}>
                  <Box
                    sx={{
                      background: "linear-gradient(180deg, #5cb4ff 0%, #2156d9 100%)",
                      borderRadius: "10px 10px 4px 4px",
                      height: `${normalizedHeight}px`,
                      width: "100%",
                    }}
                  />
                </Box>
                <Typography sx={{ fontWeight: 800, textTransform: "capitalize" }} variant="caption">
                  {point.label}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  {valuePrefix}
                  {formatCompactMoney(point.value)}
                </Typography>
              </Stack>
            );
          })}
        </Box>
        {!hasData ? (
          <Typography color="text.secondary" sx={{ textAlign: "center" }} variant="body2">
            Sin datos para graficar
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}

export function DashboardScreen({
  auditoria,
  cuentas,
  inventario,
  metrics,
  ordenes,
  pagos,
}: DashboardScreenProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const openOrders = ordenes.filter(isOpenOrder);
  const delayedOrders = openOrders.filter((order) => {
    const dueDate = parseDate(order.fechaVencimiento) ?? parseDate(order.fechaDocumento);
    return dueDate ? dueDate.getTime() < today.getTime() : false;
  });
  const pendingPayments = cuentas.filter((cuenta) => cuenta.saldo > 0);
  const overduePayments = pendingPayments.filter((cuenta) => {
    const dueDate = parseDate(cuenta.vencimiento);
    return dueDate ? dueDate.getTime() < today.getTime() : false;
  });
  const lowStockRows = inventario.filter((row) => row.disponible <= 0);
  const totalPaidAmount = pagos.reduce((total, pago) => total + pago.monto, 0);
  const totalSpentAmount = ordenes.reduce((total, order) => total + order.total, 0);
  const lateDeliveriesRate = openOrders.length > 0 ? (delayedOrders.length / openOrders.length) * 100 : 0;
  const currency = ordenes[0]?.moneda ?? "Bs";
  const activeProviders = resolveActiveProviderCount(metrics, ordenes);
  const monthlyPurchases = buildMonthlyPurchaseSeries(ordenes);
  const spendDistribution = buildCategorySpendSegments(ordenes);
  const statusSegments = buildStatusSegments(openOrders);
  const delayedByProvider = resolveDelayedByProvider(delayedOrders);
  const recentAudit = auditoria.slice(0, 6);
  const latestOrders = [...ordenes]
    .sort((a, b) => (parseDate(b.fechaDocumento)?.getTime() ?? 0) - (parseDate(a.fechaDocumento)?.getTime() ?? 0))
    .slice(0, 8);

  const executiveKpis = [
    {
      label: "Ordenes de Compra Pendientes",
      value: `${openOrders.length}`,
      hint: `${openOrders.length} en flujo operativo`,
    },
    {
      label: "Total Gastado",
      value: `${currency} ${moneyFormatter.format(totalSpentAmount)}`,
      hint: `${ordenes.length} ordenes contabilizadas | ${currency} ${moneyFormatter.format(totalPaidAmount)} pagados`,
    },
    {
      label: "% de Entregas Tardias",
      value: `${percentageFormatter.format(lateDeliveriesRate)}%`,
      hint: `${delayedOrders.length} de ${openOrders.length || 0} pendientes`,
    },
    {
      label: "Proveedores Activos",
      value: `${activeProviders}`,
      hint: "Con actividad en compras",
    },
  ];

  const criticalAlerts: Array<{ detail: string; label: string; total: number }> = [];

  if (delayedOrders.length > 0) {
    criticalAlerts.push({
      detail: delayedByProvider ?? "Hay ordenes vencidas sin recepcion completa.",
      label: "Entregas retrasadas",
      total: delayedOrders.length,
    });
  }

  if (lowStockRows.length > 0) {
    criticalAlerts.push({
      detail: `Articulo en riesgo: ${lowStockRows[0]?.sku ?? "N/A"} - ${lowStockRows[0]?.nombre ?? "Sin nombre"}`,
      label: "Rupturas de stock",
      total: lowStockRows.length,
    });
  }

  if (overduePayments.length > 0) {
    criticalAlerts.push({
      detail: `${overduePayments[0]?.proveedor ?? "Proveedor"} tiene documentos vencidos por pagar.`,
      label: "Facturas vencidas",
      total: overduePayments.length,
    });
  }

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          borderColor: "rgba(20, 32, 51, 0.08)",
          background: "linear-gradient(130deg, #112344 0%, #1a3d75 55%, #2452a1 100%)",
          color: "#e7eefc",
          p: 3,
        }}
        variant="outlined"
      >
        <Stack direction={{ md: "row", xs: "column" }} spacing={2} sx={{ alignItems: { md: "center", xs: "stretch" }, justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ color: "rgba(231, 238, 252, 0.8)", fontSize: 12, fontWeight: 850, letterSpacing: 0.6, textTransform: "uppercase" }}>
              ERP Compras
            </Typography>
            <Typography component="h2" sx={{ fontWeight: 900, mt: 0.5 }} variant="h4">
              Dashboard principal gerencial
            </Typography>
            <Typography sx={{ color: "rgba(231, 238, 252, 0.8)" }}>
              Control de compras, tendencias de gasto y alertas operativas en una sola vista.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip label={`${ordenes.length} ordenes`} sx={{ bgcolor: "rgba(255, 255, 255, 0.14)", color: "#e7eefc" }} />
            <Chip label={`${pendingPayments.length} CxP pendientes`} sx={{ bgcolor: "rgba(255, 255, 255, 0.14)", color: "#e7eefc" }} />
            <Chip label={`${criticalAlerts.length} alertas criticas`} sx={{ bgcolor: "rgba(255, 255, 255, 0.14)", color: "#e7eefc" }} />
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { lg: "repeat(4, minmax(0, 1fr))", md: "repeat(2, minmax(0, 1fr))", xs: "1fr" },
        }}
      >
        {executiveKpis.map((kpi, index) => (
          <Paper
            key={kpi.label}
            sx={{
              background:
                index === 2
                  ? "linear-gradient(160deg, #1f2f48 0%, #3f2442 100%)"
                  : "linear-gradient(160deg, #12274a 0%, #102f5e 100%)",
              borderColor: "rgba(99, 172, 255, 0.3)",
              color: "#e7eefc",
              p: 2.25,
            }}
            variant="outlined"
          >
            <Stack spacing={1.1}>
              <Typography sx={{ color: "rgba(231, 238, 252, 0.82)", fontSize: 13, fontWeight: 700 }}>
                {kpi.label}
              </Typography>
              <Typography component="strong" sx={{ fontSize: { md: 30, xs: 26 }, fontWeight: 900, lineHeight: 1.1 }}>
                {kpi.value}
              </Typography>
              <Typography sx={{ color: "rgba(231, 238, 252, 0.72)" }} variant="body2">
                {kpi.hint}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xl: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(320px, 0.8fr)", lg: "repeat(2, minmax(0, 1fr))", xs: "1fr" },
        }}
      >
        <MonthlySpendBarsCard
          points={monthlyPurchases}
          valuePrefix={`${currency} `}
        />

        <DonutChartCard
          description="Participacion porcentual del gasto por categoria detectada en lineas de compra."
          segments={spendDistribution}
          title="Distribucion de gasto por categoria"
        />

        <Paper
          sx={{
            background: "linear-gradient(160deg, #45121f 0%, #6b1028 100%)",
            borderColor: "rgba(255, 153, 153, 0.28)",
            color: "#fde6ec",
            gridColumn: { lg: "1 / -1", xl: "auto" },
            p: 2.5,
          }}
          variant="outlined"
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ErrorOutlineIcon fontSize="small" />
                <Typography component="h3" sx={{ fontWeight: 850 }} variant="h6">
                  Alertas criticas
                </Typography>
              </Stack>
              <Chip
                label={`${criticalAlerts.length} activas`}
                size="small"
                sx={{ bgcolor: "rgba(255, 255, 255, 0.16)", color: "#fde6ec", fontWeight: 800 }}
              />
            </Stack>

            {criticalAlerts.length > 0 ? (
              criticalAlerts.map((alert) => (
                <Box
                  key={alert.label}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    borderRadius: 2,
                    p: 1.25,
                  }}
                >
                  <Typography sx={{ fontSize: 14, fontWeight: 850 }}>
                    {alert.total}x {alert.label}
                  </Typography>
                  <Typography sx={{ color: "rgba(253, 230, 236, 0.86)" }} variant="body2">
                    {alert.detail}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: "rgba(253, 230, 236, 0.82)" }} variant="body2">
                No hay alertas urgentes. Operacion estable.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { lg: "minmax(300px, 0.8fr) minmax(0, 1.2fr)", xs: "1fr" },
        }}
      >
        <DonutChartCard
          description="Seguimiento de carga operativa de las OC abiertas."
          segments={statusSegments}
          title="Estado de ordenes de compra"
        />

        <DataTable
          title="Ultimas ordenes de compra"
          description="Documentos recientes para seguimiento diario de proveedores y estado."
          headers={["OC #", "Fecha", "Proveedor", "Total", "Estado"]}
          rows={latestOrders.map((order) => [
            <strong key={`${order.id}-doc`}>OC-{order.docNum}</strong>,
            order.fechaDocumento,
            order.proveedor,
            `${order.moneda} ${moneyFormatter.format(order.total)}`,
            <Badge key={`${order.id}-status`} tone={resolveTone(order.estado)}>
              {order.estado}
            </Badge>,
          ])}
        />
      </Box>

      {recentAudit.length > 0 ? (
        <Paper sx={{ p: 2.5 }} variant="outlined">
          <Stack direction={{ md: "row", xs: "column" }} spacing={2} sx={{ alignItems: { md: "center", xs: "stretch" }, justifyContent: "space-between", mb: 2 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <HistoryIcon color="primary" fontSize="small" />
              <Box>
                <Typography component="h3" variant="h6">
                  Actividad reciente
                </Typography>
                <Typography color="text.secondary">
                  Ultimos eventos auditados en operaciones sensibles.
                </Typography>
              </Box>
            </Stack>
            <a className="link-button" href={`#${buildViewPath("auditoria")}`}>
              Ver bitacora
            </a>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { lg: "repeat(3, minmax(0, 1fr))", md: "repeat(2, minmax(0, 1fr))", xs: "1fr" },
            }}
          >
            {recentAudit.map((audit) => (
              <Paper key={audit.id} sx={{ p: 2 }} variant="outlined">
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                    <Badge tone={getAuditTone(audit.accion)}>{audit.accion}</Badge>
                    <Typography color="text.secondary" variant="caption">
                      {audit.fecha}
                    </Typography>
                  </Stack>
                  <Box>
                    <Typography component="strong" sx={{ display: "block", fontWeight: 850 }}>
                      {audit.entidad}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {audit.entidadId ?? "Sin identificador"}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{audit.usuario}</Typography>
                </Stack>
              </Paper>
            ))}
          </Box>
        </Paper>
      ) : null}
    </Stack>
  );
}
