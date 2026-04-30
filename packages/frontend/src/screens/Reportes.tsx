import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  NativeSelect,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import PaymentsIcon from "@mui/icons-material/Payments";

import { BarChartCard, DonutChartCard, LineChartCard, type ChartPoint } from "../components/Common/Charts";
import { DataTable } from "../components/Common/DataTable";
import { Badge } from "../components/Common/Badge";
import { resolveTone } from "../mocks/data";
import { buildViewPath } from "../router/views";
import type { AppData } from "../types";

type ReportesScreenProps = {
  data: AppData;
};

type DatePreset = "all" | "month" | "quarter" | "year" | "custom";

type ReportFilters = {
  datePreset: DatePreset;
  endDate: string;
  estado: string;
  proveedorId: string;
  startDate: string;
  warehouse: string;
};

type SmartAlertSeverity = "Alta" | "Media" | "Baja";

type SmartAlert = {
  actionLabel: string;
  destination: "cxp" | "inventario" | "ordenes";
  impact: string;
  message: string;
  query?: string;
  severity: SmartAlertSeverity;
  title: string;
  type: "credito" | "orden" | "cxp" | "stock" | "pago";
};

const currencyFormatter = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const defaultFilters: ReportFilters = {
  datePreset: "all",
  endDate: "",
  estado: "",
  proveedorId: "",
  startDate: "",
  warehouse: "",
};

const percent = (value: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / total) * 100));
};

const formatMoney = (amount: number): string => `Bs ${currencyFormatter.format(amount)}`;

const csvValue = (value: string | number | boolean | null | undefined): string => {
  const rawValue = value === null || value === undefined ? "" : String(value);
  return `"${rawValue.replace(/"/g, '""')}"`;
};

const csvRow = (values: Array<string | number | boolean | null | undefined>): string =>
  values.map(csvValue).join(",");

const downloadTextFile = (filename: string, content: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const toInputDate = (date: Date): string => date.toISOString().slice(0, 10);

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

const endOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const parseReportDate = (value?: string): Date | null => {
  if (!value) {
    return null;
  }

  if (/^\d{2}\/\d{2}\/\d{4}/.test(value)) {
    const [day, month, year] = value.slice(0, 10).split("/");
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const resolveDateRange = (filters: ReportFilters): { end: Date; start: Date } | null => {
  const today = new Date();

  if (filters.datePreset === "month") {
    return {
      start: startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)),
      end: endOfDay(today),
    };
  }

  if (filters.datePreset === "quarter") {
    const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
    return {
      start: startOfDay(new Date(today.getFullYear(), quarterStartMonth, 1)),
      end: endOfDay(today),
    };
  }

  if (filters.datePreset === "year") {
    return {
      start: startOfDay(new Date(today.getFullYear(), 0, 1)),
      end: endOfDay(today),
    };
  }

  if (filters.datePreset === "custom") {
    const start = filters.startDate ? parseReportDate(filters.startDate) : null;
    const end = filters.endDate ? parseReportDate(filters.endDate) : null;

    if (start && end) {
      return { start: startOfDay(start), end: endOfDay(end) };
    }

    if (start) {
      return { start: startOfDay(start), end: endOfDay(today) };
    }

    if (end) {
      return { start: startOfDay(new Date(1970, 0, 1)), end: endOfDay(end) };
    }
  }

  return null;
};

const isInsideDateRange = (value: string | undefined, range: { end: Date; start: Date } | null): boolean => {
  if (!range) {
    return true;
  }

  const parsed = parseReportDate(value);
  if (!parsed) {
    return false;
  }

  return parsed >= range.start && parsed <= range.end;
};

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

const daysUntil = (value: string): number | null => {
  const parsed = parseReportDate(value);
  if (!parsed) {
    return null;
  }

  const today = startOfDay(new Date());
  const target = startOfDay(parsed);
  return Math.ceil((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
};

const buildSmartAlerts = (data: AppData): SmartAlert[] => {
  const alerts: SmartAlert[] = [];

  data.proveedores
    .filter((provider) => provider.lineaCredito > 0 && provider.balance > provider.lineaCredito)
    .slice(0, 4)
    .forEach((provider) => {
      alerts.push({
        actionLabel: "Revisar ordenes",
        destination: "ordenes",
        impact: `${formatMoney(provider.balance - provider.lineaCredito)} sobre linea`,
        message: `${provider.cardName} supera su linea de credito configurada.`,
        query: provider.cardName,
        severity: "Alta",
        title: "Proveedor sobre linea de credito",
        type: "credito",
      });
    });

  data.ordenes
    .filter((order) => order.estado === "APROBADO" && order.lines.some((line) => line.pendingQty > 0))
    .slice(0, 4)
    .forEach((order) => {
      const pendingQty = order.lines.reduce((total, line) => total + line.pendingQty, 0);
      alerts.push({
        actionLabel: "Ver orden",
        destination: "ordenes",
        impact: `${pendingQty.toLocaleString("es-BO")} unidades pendientes`,
        message: `OC-${order.docNum} esta aprobada y aun tiene recepcion pendiente.`,
        query: `OC-${order.docNum}`,
        severity: "Media",
        title: "Orden aprobada sin recepcion completa",
        type: "orden",
      });
    });

  data.cxp
    .map((cuenta) => ({ cuenta, days: daysUntil(cuenta.vencimiento) }))
    .filter(({ cuenta, days }) => cuenta.saldo > 0 && days !== null && days <= 7)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
    .slice(0, 5)
    .forEach(({ cuenta, days }) => {
      const isOverdue = (days ?? 0) < 0;
      alerts.push({
        actionLabel: "Ver CxP",
        destination: "cxp",
        impact: `${formatMoney(cuenta.saldo)} pendiente`,
        message: `${cuenta.factura} de ${cuenta.proveedor} ${isOverdue ? "esta vencida" : `vence en ${days} dia(s)`}.`,
        query: cuenta.factura,
        severity: isOverdue ? "Alta" : "Media",
        title: isOverdue ? "Factura vencida" : "Factura proxima a vencer",
        type: "cxp",
      });
    });

  data.inventario
    .filter((row) => row.disponible <= 0)
    .slice(0, 5)
    .forEach((row) => {
      alerts.push({
        actionLabel: "Ver inventario",
        destination: "inventario",
        impact: `${row.disponible.toLocaleString("es-BO")} disponible`,
        message: `${row.sku} - ${row.nombre} no tiene stock disponible en ${row.almacen}.`,
        query: row.sku,
        severity: "Alta",
        title: "Articulo sin stock disponible",
        type: "stock",
      });
    });

  data.cxp
    .filter((cuenta) => cuenta.saldo > 0 && cuenta.saldo < cuenta.total)
    .slice(0, 4)
    .forEach((cuenta) => {
      alerts.push({
        actionLabel: "Ver pagos",
        destination: "cxp",
        impact: `${formatMoney(cuenta.saldo)} aun pendiente`,
        message: `${cuenta.factura} tiene pago parcial registrado.`,
        query: cuenta.factura,
        severity: "Baja",
        title: "Pago parcial pendiente",
        type: "pago",
      });
    });

  const severityRank: Record<SmartAlertSeverity, number> = { Alta: 0, Media: 1, Baja: 2 };
  return alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]).slice(0, 10);
};

const buildReportCsv = (
  data: AppData,
  summaries: Array<{ label: string; value: string; hint: string }>,
  alerts: SmartAlert[],
): string => {
  const lines = [
    csvRow(["ERP Compras", "Reporte operativo"]),
    csvRow(["Generado", new Date().toLocaleString("es-BO")]),
    "",
    csvRow(["Resumen"]),
    csvRow(["Indicador", "Valor", "Detalle"]),
    ...summaries.map((summary) => csvRow([summary.label, summary.value, summary.hint])),
    "",
    csvRow(["Alertas inteligentes"]),
    csvRow(["Severidad", "Tipo", "Titulo", "Detalle", "Impacto"]),
    ...alerts.map((alert) =>
      csvRow([alert.severity, alert.type, alert.title, alert.message, alert.impact]),
    ),
    "",
    csvRow(["Ordenes abiertas"]),
    csvRow(["Documento", "Proveedor", "Estado", "Moneda", "Total", "Fecha"]),
    ...data.ordenes.map((order) =>
      csvRow([`OC-${order.docNum}`, order.proveedor, order.estado, order.moneda, order.total, order.fecha]),
    ),
    "",
    csvRow(["Cuentas por pagar"]),
    csvRow(["Factura", "Proveedor", "Estado", "Total", "Saldo", "Vencimiento"]),
    ...data.cxp.map((cuenta) =>
      csvRow([cuenta.factura, cuenta.proveedor, cuenta.estado, cuenta.total, cuenta.saldo, cuenta.vencimiento]),
    ),
    "",
    csvRow(["Pagos"]),
    csvRow(["Proveedor", "Monto", "Fecha", "Referencia", "Usuario"]),
    ...data.pagos.map((pago) =>
      csvRow([pago.proveedor, pago.monto, pago.fecha, pago.referencia, pago.usuario]),
    ),
    "",
    csvRow(["Inventario"]),
    csvRow(["SKU", "Articulo", "Almacen", "Fisico", "Comprometido", "Solicitado", "Disponible"]),
    ...data.inventario.map((row) =>
      csvRow([row.sku, row.nombre, row.almacen, row.fisico, row.comprometido, row.solicitado, row.disponible]),
    ),
  ];

  return `\uFEFF${lines.join("\n")}`;
};

export function ReportesScreen({ data }: ReportesScreenProps) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters);
  const dateRange = useMemo(() => resolveDateRange(filters), [filters]);
  const warehouseOptions = useMemo(
    () => [...new Set(data.inventario.map((row) => row.almacen))].sort((a, b) => a.localeCompare(b)),
    [data.inventario],
  );
  const statusOptions = useMemo(
    () =>
      [...new Set([...data.ordenes.map((orden) => orden.estado), ...data.cxp.map((cuenta) => cuenta.estado)])]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [data.cxp, data.ordenes],
  );
  const filteredData = useMemo<AppData>(() => {
    const ordenes = data.ordenes.filter((orden) => {
      if (filters.proveedorId && orden.proveedorId !== filters.proveedorId) {
        return false;
      }

      if (filters.estado && orden.estado !== filters.estado) {
        return false;
      }

      return isInsideDateRange(orden.fechaDocumento, dateRange);
    });
    const cxp = data.cxp.filter((cuenta) => {
      if (filters.proveedorId && cuenta.proveedorId !== filters.proveedorId) {
        return false;
      }

      if (filters.estado && cuenta.estado !== filters.estado) {
        return false;
      }

      return isInsideDateRange(cuenta.vencimiento, dateRange);
    });
    const pagos = data.pagos.filter((pago) => {
      if (filters.proveedorId && pago.proveedorId !== filters.proveedorId) {
        return false;
      }

      return isInsideDateRange(pago.fecha, dateRange);
    });
    const inventario = data.inventario.filter((row) =>
      filters.warehouse ? row.almacen === filters.warehouse : true,
    );

    return {
      ...data,
      cxp,
      inventario,
      ordenes,
      pagos,
      proveedores: filters.proveedorId
        ? data.proveedores.filter((provider) => provider.id === filters.proveedorId)
        : data.proveedores,
    };
  }, [data, dateRange, filters]);

  const totalCompras = filteredData.ordenes.reduce((total, orden) => total + orden.total, 0);
  const saldoCxp = filteredData.cxp.reduce((total, cuenta) => total + cuenta.saldo, 0);
  const pagosRegistrados = filteredData.pagos.reduce((total, pago) => total + pago.monto, 0);
  const stockDisponible = filteredData.inventario.reduce((total, row) => total + row.disponible, 0);
  const stockComprometido = filteredData.inventario.reduce((total, row) => total + row.comprometido, 0);
  const ordenesAbiertas = filteredData.ordenes.filter((orden) =>
    ["BORRADOR", "APROBADO", "ABIERTO"].includes(orden.estado),
  );
  const cxpVencidas = filteredData.cxp.filter((cuenta) => cuenta.estado === "VENCIDA" || cuenta.saldo > 0);
  const proveedoresTop = [...filteredData.proveedores]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);
  const articulosBajoStock = [...filteredData.inventario]
    .sort((a, b) => a.disponible - b.disponible)
    .slice(0, 8);
  const monthlySeries = buildMonthlySeries(filteredData);
  const stockByWarehouse = buildStockByWarehouse(filteredData);
  const cxpSegments = buildCxpSegments(filteredData);
  const smartAlerts = buildSmartAlerts(filteredData);
  const activeFilterCount = [
    filters.datePreset !== "all",
    filters.proveedorId,
    filters.warehouse,
    filters.estado,
  ].filter(Boolean).length;

  const summaries = [
    {
      label: "Compras acumuladas",
      value: formatMoney(totalCompras),
      icon: <ReceiptLongIcon />,
      hint: `${filteredData.ordenes.length} ordenes filtradas`,
    },
    {
      label: "Saldo por pagar",
      value: formatMoney(saldoCxp),
      icon: <RequestQuoteIcon />,
      hint: `${filteredData.cxp.filter((cuenta) => cuenta.saldo > 0).length} cuentas con saldo`,
    },
    {
      label: "Pagos registrados",
      value: formatMoney(pagosRegistrados),
      icon: <RequestQuoteIcon />,
      hint: `${filteredData.pagos.length} pagos filtrados`,
    },
    {
      label: "Stock disponible",
      value: stockDisponible.toLocaleString("es-BO"),
      icon: <Inventory2Icon />,
      hint: `${stockComprometido.toLocaleString("es-BO")} unidades comprometidas`,
    },
  ];
  const exportFilenameDate = toInputDate(new Date());
  const exportCsv = () => {
    downloadTextFile(
      `erp-reportes-${exportFilenameDate}.csv`,
      buildReportCsv(filteredData, summaries, smartAlerts),
      "text/csv;charset=utf-8",
    );
  };
  const exportPdf = () => {
    window.print();
  };
  const goToView = (view: "cxp" | "inventario" | "ordenes", query?: string) => {
    const params = query ? `?q=${encodeURIComponent(query)}` : "";
    navigate(`${buildViewPath(view)}${params}`);
  };
  const alertIconByType = {
    credito: <CreditScoreIcon fontSize="small" />,
    cxp: <EventBusyIcon fontSize="small" />,
    orden: <ReceiptLongIcon fontSize="small" />,
    pago: <PaymentsIcon fontSize="small" />,
    stock: <Inventory2Icon fontSize="small" />,
  } satisfies Record<SmartAlert["type"], ReactNode>;
  const alertColorBySeverity = {
    Alta: "error",
    Media: "warning",
    Baja: "info",
  } satisfies Record<SmartAlertSeverity, "error" | "info" | "warning">;

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }} variant="outlined">
        <Stack direction={{ md: "row", xs: "column" }} spacing={2} sx={{ alignItems: { md: "center", xs: "stretch" }, justifyContent: "space-between" }}>
          <Box>
            <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 850, letterSpacing: 0.6, textTransform: "uppercase" }}>
              Analitica ejecutiva
            </Typography>
            <Typography component="h2" sx={{ fontWeight: 900, mt: 0.5 }} variant="h4">
              Reportes operativos
            </Typography>
            <Typography color="text.secondary">
              Indicadores filtrables para seguimiento de compras, pagos, proveedores e inventario.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip color="primary" label={`${filteredData.ordenes.length} ordenes`} variant="outlined" />
            <Chip color="warning" label={`${filteredData.cxp.length} CxP`} variant="outlined" />
            <Chip color="success" label={`${filteredData.pagos.length} pagos`} variant="outlined" />
            <Chip color="secondary" label={`${filteredData.inventario.length} stocks`} variant="outlined" />
          </Stack>
        </Stack>
      </Paper>

      <Paper className="no-print" sx={{ p: 2.5 }} variant="outlined">
        <Stack spacing={2}>
          <Stack direction={{ md: "row", xs: "column" }} spacing={1.5} sx={{ alignItems: { md: "center", xs: "stretch" }, justifyContent: "space-between" }}>
            <Box>
                <Typography component="h3" sx={{ fontWeight: 850 }} variant="h6">
                  Filtros ejecutivos
                </Typography>
              <Typography color="text.secondary" variant="body2">
                Ajusta el periodo, proveedor, almacen o estado para recalcular graficos y tablas.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Chip color={activeFilterCount > 0 ? "primary" : "default"} label={`${activeFilterCount} filtros activos`} variant="outlined" />
              <Button onClick={() => setFilters(defaultFilters)} variant="outlined">
                Limpiar
              </Button>
              <Button onClick={exportCsv} startIcon={<DownloadIcon />} variant="contained">
                CSV
              </Button>
              <Button onClick={exportPdf} startIcon={<PictureAsPdfIcon />} variant="outlined">
                PDF
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { lg: "1fr 1fr 1fr 1fr", md: "repeat(2, minmax(0, 1fr))", xs: "1fr" },
            }}
          >
            <FormControl fullWidth>
              <InputLabel htmlFor="report-date-preset" shrink>
                Periodo
              </InputLabel>
              <NativeSelect
                inputProps={{ id: "report-date-preset" }}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    datePreset: event.target.value as DatePreset,
                  }))
                }
                value={filters.datePreset}
              >
                <option value="all">Todo el historico</option>
                <option value="month">Mes actual</option>
                <option value="quarter">Trimestre actual</option>
                <option value="year">Ano actual</option>
                <option value="custom">Personalizado</option>
              </NativeSelect>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel htmlFor="report-provider" shrink>
                Proveedor
              </InputLabel>
              <NativeSelect
                inputProps={{ id: "report-provider" }}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, proveedorId: event.target.value }))
                }
                value={filters.proveedorId}
              >
                <option value="">Todos</option>
                {data.proveedores.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.cardName}
                  </option>
                ))}
              </NativeSelect>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel htmlFor="report-warehouse" shrink>
                Almacen
              </InputLabel>
              <NativeSelect
                inputProps={{ id: "report-warehouse" }}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, warehouse: event.target.value }))
                }
                value={filters.warehouse}
              >
                <option value="">Todos</option>
                {warehouseOptions.map((warehouse) => (
                  <option key={warehouse} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </NativeSelect>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel htmlFor="report-status" shrink>
                Estado
              </InputLabel>
              <NativeSelect
                inputProps={{ id: "report-status" }}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, estado: event.target.value }))
                }
                value={filters.estado}
              >
                <option value="">Todos</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </NativeSelect>
            </FormControl>
          </Box>

          {filters.datePreset === "custom" ? (
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { md: "repeat(2, minmax(0, 1fr))", xs: "1fr" },
              }}
            >
              <TextField
                fullWidth
                label="Desde"
                onChange={(event) =>
                  setFilters((current) => ({ ...current, startDate: event.target.value }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
                type="date"
                value={filters.startDate}
              />
              <TextField
                fullWidth
                label="Hasta"
                onChange={(event) =>
                  setFilters((current) => ({ ...current, endDate: event.target.value }))
                }
                slotProps={{
                  htmlInput: { min: filters.startDate || undefined },
                  inputLabel: { shrink: true },
                }}
                type="date"
                value={filters.endDate}
              />
            </Box>
          ) : dateRange ? (
            <Typography color="text.secondary" variant="body2">
              Periodo aplicado: {toInputDate(dateRange.start)} a {toInputDate(dateRange.end)}
            </Typography>
          ) : null}
        </Stack>
      </Paper>

      <Box className="print-only">
        <Typography component="h1" variant="h4">
          ERP Compras - Reporte operativo
        </Typography>
        <Typography color="text.secondary">
          Generado el {new Date().toLocaleString("es-BO")}
        </Typography>
      </Box>

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
                <Typography component="p" sx={{ fontWeight: 900, lineHeight: 1.05 }} variant="h5">
                  {summary.value}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {summary.hint}
                </Typography>
                {summary.label === "Compras acumuladas" ? (
                  <Button onClick={() => goToView("ordenes", filters.estado || undefined)} size="small" variant="text">
                    Ver ordenes
                  </Button>
                ) : null}
                {summary.label === "Saldo por pagar" ? (
                  <Button onClick={() => goToView("cxp", filters.estado || "pendiente")} size="small" variant="text">
                    Ver CxP
                  </Button>
                ) : null}
                {summary.label === "Stock disponible" ? (
                  <Button onClick={() => goToView("inventario", filters.warehouse || undefined)} size="small" variant="text">
                    Ver inventario
                  </Button>
                ) : null}
              </Stack>
            </Paper>
          </Box>
        ))}
      </Box>

      <Paper sx={{ p: 2.5 }} variant="outlined">
        <Stack spacing={2}>
          <Stack direction={{ md: "row", xs: "column" }} spacing={1.5} sx={{ alignItems: { md: "center", xs: "stretch" }, justifyContent: "space-between" }}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ReportProblemIcon fontSize="small" />
                <Typography component="h3" sx={{ fontWeight: 850 }} variant="h6">
                  Alertas inteligentes
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="body2">
                Riesgos detectados automaticamente sobre proveedores, recepciones, CxP, pagos e inventario.
              </Typography>
            </Box>
            <Chip
              color={smartAlerts.some((alert) => alert.severity === "Alta") ? "error" : "success"}
              label={`${smartAlerts.length} alertas`}
              variant="outlined"
            />
          </Stack>

          {smartAlerts.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: { lg: "repeat(2, minmax(0, 1fr))", xs: "1fr" },
              }}
            >
              {smartAlerts.map((alert) => (
                <Paper
                  key={`${alert.type}-${alert.title}-${alert.message}`}
                  sx={{
                    borderColor: `${alertColorBySeverity[alert.severity]}.main`,
                    p: 2,
                  }}
                  variant="outlined"
                >
                  <Stack spacing={1.25}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
                        {alertIconByType[alert.type]}
                        <Typography sx={{ fontWeight: 850 }} variant="body2">
                          {alert.title}
                        </Typography>
                      </Stack>
                      <Chip
                        color={alertColorBySeverity[alert.severity]}
                        label={alert.severity}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                    <Typography color="text.secondary" variant="body2">
                      {alert.message}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                      <Typography sx={{ fontWeight: 800 }} variant="body2">
                        {alert.impact}
                      </Typography>
                      <Button
                        onClick={() => goToView(alert.destination, alert.query)}
                        size="small"
                        variant="text"
                      >
                        {alert.actionLabel}
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          ) : (
            <Paper sx={{ bgcolor: "rgba(21, 128, 61, 0.06)", p: 2 }} variant="outlined">
              <Typography color="success.main" sx={{ fontWeight: 850 }}>
                No hay alertas criticas con los filtros actuales.
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Los indicadores no muestran riesgos inmediatos de credito, vencimiento, recepcion o stock.
              </Typography>
            </Paper>
          )}
        </Stack>
      </Paper>

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
                  <LinearProgress sx={{ height: 8, borderRadius: 99 }} value={percent(ordenesAbiertas.length, filteredData.ordenes.length)} variant="determinate" />
                  <Button onClick={() => goToView("ordenes", "ABIERTO")} size="small" sx={{ mt: 0.5 }} variant="text">
                    Ir a ordenes
                  </Button>
                </Box>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography>CxP con saldo</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{cxpVencidas.length}</Typography>
                  </Stack>
                  <LinearProgress color="warning" sx={{ height: 8, borderRadius: 99 }} value={percent(cxpVencidas.length, filteredData.cxp.length)} variant="determinate" />
                  <Button onClick={() => goToView("cxp", "VENCIDA")} size="small" sx={{ mt: 0.5 }} variant="text">
                    Ir a CxP
                  </Button>
                </Box>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography>Articulos sin disponible</Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {filteredData.inventario.filter((row) => row.disponible <= 0).length}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    color="error"
                    sx={{ height: 8, borderRadius: 99 }}
                    value={percent(
                      filteredData.inventario.filter((row) => row.disponible <= 0).length,
                      filteredData.inventario.length,
                    )}
                    variant="determinate"
                  />
                  <Button onClick={() => goToView("inventario", filters.warehouse || undefined)} size="small" sx={{ mt: 0.5 }} variant="text">
                    Ir a inventario
                  </Button>
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
              <Stack direction="row" key={`${provider.id}-actions`} spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <span>{formatMoney(provider.balance)}</span>
                <Button onClick={() => goToView("ordenes", provider.cardName)} size="small" variant="text">
                  Ver
                </Button>
              </Stack>,
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
          <Stack direction="row" key={`${row.id}-actions`} spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <span>{row.comprometido.toLocaleString("es-BO")}</span>
            <Button onClick={() => goToView("inventario", row.sku)} size="small" variant="text">
              Ver
            </Button>
          </Stack>,
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
          <Stack direction="row" key={`${order.id}-actions`} spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <span>{`${order.moneda} ${currencyFormatter.format(order.total)}`}</span>
            <Button onClick={() => goToView("ordenes", `OC-${order.docNum}`)} size="small" variant="text">
              Ver
            </Button>
          </Stack>,
        ])}
        title="Ordenes abiertas"
      />
    </Stack>
  );
}
