import type { Articulo } from "src/domain/entities/Articulo";
import type { EstadoDocumento, GrupoArticulo } from "src/domain/entities/Catalogos";
import type { CuentaPorPagar } from "src/domain/entities/CuentaPorPagar";
import type { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { PagoProveedor } from "src/domain/entities/PagoProveedor";
import type { Proveedor } from "src/domain/entities/Proveedor";
import type { HttpDependencies } from "src/presentation/http/dependencies";
import { API_ENDPOINTS } from "src/presentation/http/endpoints";
import { corsHeaders, json } from "src/presentation/http/response";

type PowerBiRouteDependencies = Pick<
  HttpDependencies,
  | "createOrdenCompraContext"
  | "createProveedorContext"
  | "createArticuloContext"
  | "createCatalogoContext"
  | "createCuentasPorPagarContext"
>;

const PEDIDO_COMPRA_TIPO_DOC_ID = 2;
const OPEN_STATES = new Set(["BORRADOR", "APROBADO", "ABIERTO"]);

const toMonthKey = (value: Date): string =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;

const parseRangeDate = (value: string | null, type: "end" | "start"): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (type === "start") {
    parsed.setHours(0, 0, 0, 0);
  } else {
    parsed.setHours(23, 59, 59, 999);
  }

  return parsed;
};

const csvValue = (value: boolean | null | number | string | undefined): string => {
  const raw = value == null ? "" : String(value);
  return `"${raw.replace(/"/g, "\"\"")}"`;
};

const csvRow = (values: Array<boolean | null | number | string | undefined>): string =>
  values.map(csvValue).join(",");

const formatDateIso = (date: Date): string => date.toISOString().slice(0, 10);

const matchesRange = (date: Date, from: Date | null, to: Date | null): boolean => {
  if (from && date < from) {
    return false;
  }

  if (to && date > to) {
    return false;
  }

  return true;
};

type PowerBiDataShape = {
  accountsPayable: CuentaPorPagar[];
  articulos: Articulo[];
  estados: EstadoDocumento[];
  grupos: GrupoArticulo[];
  ordenes: OrdenCompra[];
  pagos: PagoProveedor[];
  proveedores: Proveedor[];
};

const loadPowerBiData = async (dependencies: PowerBiRouteDependencies): Promise<PowerBiDataShape> => {
  const ordenContext = dependencies.createOrdenCompraContext();
  const proveedorContext = dependencies.createProveedorContext();
  const articuloContext = dependencies.createArticuloContext();
  const catalogoContext = dependencies.createCatalogoContext();
  const cuentasContext = dependencies.createCuentasPorPagarContext();

  const [ordenes, proveedores, articulos, grupos, estados, accountsPayable, pagos] = await Promise.all([
    ordenContext.listarOrdenesCompraUseCase.execute(),
    proveedorContext.listarProveedoresUseCase.execute(),
    articuloContext.listarArticulosUseCase.execute(),
    catalogoContext.listarGruposArticuloUseCase.execute(),
    catalogoContext.listarEstadosDocumentoUseCase.execute(),
    cuentasContext.listarCuentasPorPagarUseCase.execute(),
    cuentasContext.listarPagosProveedorUseCase.execute(),
  ]);

  return {
    ordenes,
    proveedores,
    articulos,
    grupos,
    estados,
    accountsPayable,
    pagos,
  };
};

const buildPowerBiPayload = (
  data: PowerBiDataShape,
  from: Date | null,
  to: Date | null,
) => {
  const providerById = new Map(data.proveedores.map((provider) => [provider.props.id, provider]));
  const articleById = new Map(data.articulos.map((article) => [article.props.id, article]));
  const groupById = new Map(data.grupos.map((group) => [group.props.id, group.props.nombre]));
  const estadoById = new Map(data.estados.map((estado) => [estado.props.id, estado.props.codigo]));
  const purchases = data.ordenes.filter((order) => {
    if (order.props.tipoDocId !== PEDIDO_COMPRA_TIPO_DOC_ID) {
      return false;
    }

    return matchesRange(order.props.fechaDocumento, from, to);
  });

  const monthlyAggregates = new Map<string, { orderCount: number; total: number }>();
  const providerAggregates = new Map<string, { orderCount: number; total: number }>();
  const productAggregates = new Map<
    string,
    { amount: number; quantity: number; sku: string; nombre: string }
  >();
  const categoryAggregates = new Map<string, number>();
  const statusAggregates = new Map<string, number>();

  for (const order of purchases) {
    const provider = providerById.get(order.props.proveedorId);
    const providerLabel = provider?.props.cardName ?? order.props.proveedorId;
    const statusCode = estadoById.get(order.props.estadoId) ?? `ESTADO_${order.props.estadoId}`;
    const monthKey = toMonthKey(order.props.fechaDocumento);

    const monthCurrent = monthlyAggregates.get(monthKey) ?? { orderCount: 0, total: 0 };
    monthCurrent.orderCount += 1;
    monthCurrent.total += order.props.totalDocumento;
    monthlyAggregates.set(monthKey, monthCurrent);

    const providerCurrent = providerAggregates.get(providerLabel) ?? { orderCount: 0, total: 0 };
    providerCurrent.orderCount += 1;
    providerCurrent.total += order.props.totalDocumento;
    providerAggregates.set(providerLabel, providerCurrent);

    statusAggregates.set(statusCode, (statusAggregates.get(statusCode) ?? 0) + 1);

    for (const detail of order.props.detalles) {
      const article = articleById.get(detail.props.articuloId);
      const sku = article?.props.itemCode ?? detail.props.articuloId;
      const nombre = article?.props.itemName ?? detail.props.descripcion ?? detail.props.articuloId;
      const group = groupById.get(article?.props.grupoId ?? -1) ?? "Sin grupo";
      const productCurrent = productAggregates.get(detail.props.articuloId) ?? {
        quantity: 0,
        amount: 0,
        sku,
        nombre,
      };
      productCurrent.quantity += detail.props.cantidadTotal;
      productCurrent.amount += detail.props.totalLinea;
      productAggregates.set(detail.props.articuloId, productCurrent);
      categoryAggregates.set(group, (categoryAggregates.get(group) ?? 0) + detail.props.totalLinea);
    }
  }

  const totalPurchases = purchases.reduce((total, order) => total + order.props.totalDocumento, 0);
  const pendingOrders = purchases.filter((order) => {
    const statusCode = estadoById.get(order.props.estadoId);
    return statusCode ? OPEN_STATES.has(statusCode) : false;
  }).length;

  const accountsPayableBalance = data.accountsPayable.reduce(
    (total, account) => total + account.props.saldoPendiente,
    0,
  );
  const paidAmount = data.pagos.reduce((total, payment) => total + payment.props.monto, 0);
  const today = new Date();
  const overdueAccounts = data.accountsPayable.filter(
    (account) =>
      account.props.saldoPendiente > 0 &&
      account.props.estado !== "ANULADA" &&
      account.props.fechaVencimiento < today,
  ).length;

  const orders = purchases.map((order) => {
    const provider = providerById.get(order.props.proveedorId);
    const status = estadoById.get(order.props.estadoId) ?? `ESTADO_${order.props.estadoId}`;

    return {
      id: order.props.id,
      docNum: order.props.docNum,
      providerId: order.props.proveedorId,
      providerName: provider?.props.cardName ?? order.props.proveedorId,
      status,
      currencyId: order.props.monedaId,
      fechaDocumento: order.props.fechaDocumento.toISOString(),
      totalDocumento: order.props.totalDocumento,
      subtotal: order.props.subtotal,
      impuestosTotal: order.props.impuestosTotal,
      descuentoTotal: order.props.descuentoTotal,
      detalles: order.props.detalles.map((detail) => {
        const article = articleById.get(detail.props.articuloId);

        return {
          lineNum: detail.props.lineNum,
          articuloId: detail.props.articuloId,
          sku: article?.props.itemCode ?? detail.props.articuloId,
          nombre: article?.props.itemName ?? detail.props.descripcion ?? detail.props.articuloId,
          grupo: groupById.get(article?.props.grupoId ?? -1) ?? "Sin grupo",
          cantidadTotal: detail.props.cantidadTotal,
          cantidadPendiente: detail.props.cantidadPendiente,
          precioUnitario: detail.props.precioUnitario,
          descuentoLinea: detail.props.descuentoLinea,
          totalLinea: detail.props.totalLinea,
        };
      }),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    period: {
      from: from ? formatDateIso(from) : null,
      to: to ? formatDateIso(to) : null,
    },
    summary: {
      totalPurchases,
      pendingOrders,
      activeProviders: data.proveedores.filter((provider) => provider.props.activo).length,
      productsPurchased: [...productAggregates.values()].reduce(
        (total, product) => total + product.quantity,
        0,
      ),
      accountsPayableBalance,
      paidAmount,
      overdueAccounts,
    },
    monthlyPurchases: [...monthlyAggregates.entries()]
      .map(([month, item]) => ({
        month,
        orderCount: item.orderCount,
        total: item.total,
      }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    topProviders: [...providerAggregates.entries()]
      .map(([provider, item]) => ({
        provider,
        orderCount: item.orderCount,
        total: item.total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20),
    topProducts: [...productAggregates.values()]
      .map((item) => ({
        sku: item.sku,
        nombre: item.nombre,
        quantity: item.quantity,
        total: item.amount,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 30),
    spendByCategory: [...categoryAggregates.entries()]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total),
    ordersByStatus: [...statusAggregates.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    orders,
  };
};

const buildPowerBiCsv = (payload: ReturnType<typeof buildPowerBiPayload>): string => {
  const lines = [
    csvRow([
      "order_id",
      "doc_num",
      "provider_id",
      "provider_name",
      "status",
      "fecha_documento",
      "line_num",
      "articulo_id",
      "sku",
      "nombre_producto",
      "grupo",
      "cantidad_total",
      "cantidad_pendiente",
      "precio_unitario",
      "descuento_linea",
      "total_linea",
      "total_documento",
    ]),
  ];

  for (const order of payload.orders) {
    for (const detail of order.detalles) {
      lines.push(
        csvRow([
          order.id,
          order.docNum,
          order.providerId,
          order.providerName,
          order.status,
          order.fechaDocumento,
          detail.lineNum,
          detail.articuloId,
          detail.sku,
          detail.nombre,
          detail.grupo,
          detail.cantidadTotal,
          detail.cantidadPendiente,
          detail.precioUnitario,
          detail.descuentoLinea,
          detail.totalLinea,
          order.totalDocumento,
        ]),
      );
    }
  }

  return lines.join("\n");
};

const powerBiSqlTemplates = {
  databaseEngine: "PostgreSQL",
  notes: [
    "Crea vistas en la base de datos para separar capa operacional y analitica.",
    "Power BI puede conectarse por DirectQuery o Import usando estas consultas base.",
  ],
  queries: {
    monthlyPurchases: `
SELECT
  to_char(fecha_documento, 'YYYY-MM') AS month,
  COUNT(*) AS order_count,
  SUM(total_documento) AS total
FROM compras_orden_compra
WHERE tipo_doc_id = 2
GROUP BY 1
ORDER BY 1;
`.trim(),
    topProviders: `
SELECT
  p.card_name AS provider,
  COUNT(*) AS order_count,
  SUM(o.total_documento) AS total
FROM compras_orden_compra o
JOIN compras_proveedor p ON p.id = o.proveedor_id
WHERE o.tipo_doc_id = 2
GROUP BY 1
ORDER BY total DESC
LIMIT 20;
`.trim(),
    topProducts: `
SELECT
  a.item_code AS sku,
  a.item_name AS nombre,
  SUM(d.cantidad_total) AS quantity,
  SUM(d.total_linea) AS total
FROM compras_orden_compra_detalle d
JOIN compras_orden_compra o ON o.id = d.orden_compra_id
JOIN compras_articulo a ON a.id = d.articulo_id
WHERE o.tipo_doc_id = 2
GROUP BY 1, 2
ORDER BY quantity DESC
LIMIT 30;
`.trim(),
    spendByCategory: `
SELECT
  g.nombre AS category,
  SUM(d.total_linea) AS total
FROM compras_orden_compra_detalle d
JOIN compras_orden_compra o ON o.id = d.orden_compra_id
JOIN compras_articulo a ON a.id = d.articulo_id
JOIN catalogo_grupo_articulo g ON g.id = a.grupo_id
WHERE o.tipo_doc_id = 2
GROUP BY 1
ORDER BY total DESC;
`.trim(),
  },
};

export const createPowerBiRouteHandler = (dependencies: PowerBiRouteDependencies) => {
  return async (
    request: Request,
    pathname: string,
    origin: string | null,
  ): Promise<Response | null> => {
    if (request.method !== "GET") {
      return null;
    }

    if (pathname === API_ENDPOINTS.powerBi.comprasSql) {
      return json(
        {
          generatedAt: new Date().toISOString(),
          ...powerBiSqlTemplates,
        },
        200,
        origin,
      );
    }

    if (pathname !== API_ENDPOINTS.powerBi.compras && pathname !== API_ENDPOINTS.powerBi.comprasCsv) {
      return null;
    }

    const url = new URL(request.url);
    const from = parseRangeDate(url.searchParams.get("from"), "start");
    const to = parseRangeDate(url.searchParams.get("to"), "end");

    if (from && to && from > to) {
      return json({ message: "El rango de fechas es invalido: from no puede ser mayor que to" }, 400, origin);
    }

    try {
      const dataset = await loadPowerBiData(dependencies);
      const payload = buildPowerBiPayload(dataset, from, to);

      if (pathname === API_ENDPOINTS.powerBi.comprasCsv) {
        return new Response(buildPowerBiCsv(payload), {
          status: 200,
          headers: {
            ...corsHeaders(origin),
            "content-disposition": "attachment; filename=powerbi-compras.csv",
            "content-type": "text/csv; charset=utf-8",
          },
        });
      }

      return json(payload, 200, origin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      return json({ message }, 500, origin);
    }
  };
};
