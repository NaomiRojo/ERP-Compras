import type { ERPApiData, RolCatalogoApi, UsuarioApi } from "../types/api";
import type {
  AccountsPayable,
  AppData,
  Article,
  Metric,
  Movement,
  Order,
  Payment,
  User,
  UserRole,
} from "../types";

const PEDIDO_COMPRA_TIPO_DOC_ID = 2;
const ENTRADA_MERCADERIA_TIPO_DOC_ID = 3;

const ROLE_CODE_BY_ID: Record<number, UserRole> = {
  1: "ADMIN",
  2: "COMPRAS",
  3: "ALMACEN",
  4: "SUPERVISOR",
};

const formatDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatDateTime = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const roleFromId = (rolId: number, roles: RolCatalogoApi[]): UserRole => {
  const catalogCode = roles.find((role) => role.id === rolId)?.codigo;
  if (
    catalogCode === "ADMIN" ||
    catalogCode === "COMPRAS" ||
    catalogCode === "ALMACEN" ||
    catalogCode === "SUPERVISOR"
  ) {
    return catalogCode;
  }

  return ROLE_CODE_BY_ID[rolId] ?? "COMPRAS";
};

const toUserLabelMap = (usuarios: UsuarioApi[]): Map<string, string> =>
  new Map(usuarios.map((usuario) => [usuario.id, usuario.nombreCompleto]));

const todayIsoDate = (): string => new Date().toISOString().slice(0, 10);

const formatCurrencyAmount = (amount: number): string =>
  new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const mapERPApiDataToAppData = (data: ERPApiData): AppData => {
  const providerById = new Map(data.proveedores.map((proveedor) => [proveedor.id, proveedor]));
  const articuloById = new Map(data.articulos.map((articulo) => [articulo.id, articulo]));
  const usuarioById = toUserLabelMap(data.usuarios);
  const monedaById = new Map(data.catalogos.monedas.map((moneda) => [moneda.id, moneda]));
  const impuestoById = new Map(data.catalogos.impuestos.map((impuesto) => [impuesto.id, impuesto]));
  const grupoById = new Map(data.catalogos.gruposArticulo.map((grupo) => [grupo.id, grupo]));
  const almacenById = new Map(data.catalogos.almacenes.map((almacen) => [almacen.id, almacen]));
  const estadoById = new Map(data.catalogos.estadosDocumento.map((estado) => [estado.id, estado]));

  const users: User[] = data.usuarios.map((usuario) => ({
    id: usuario.id,
    username: usuario.username,
    nombreCompleto: usuario.nombreCompleto,
    email: usuario.email,
    rol: roleFromId(usuario.rolId, data.catalogos.roles),
    activo: usuario.activo,
    twoFactorEnabled: usuario.twoFactorEnabled,
  }));

  const proveedores = data.proveedores.map((proveedor) => ({
    id: proveedor.id,
    cardCode: proveedor.cardCode,
    cardName: proveedor.cardName,
    nombreComercial: proveedor.nombreComercial ?? "-",
    nitRut: proveedor.nitRut,
    email: proveedor.email ?? "-",
    telefono: proveedor.telefono ?? "-",
    direccion: proveedor.direccion ?? "-",
    moneda: monedaById.get(proveedor.monedaId)?.codigo ?? `ID ${proveedor.monedaId}`,
    monedaId: proveedor.monedaId,
    lineaCredito: proveedor.lineaCredito,
    balance: proveedor.balanceCuenta,
    activo: proveedor.activo,
  }));

  const articulos: Article[] = data.articulos.map((articulo) => ({
    id: articulo.id,
    itemCode: articulo.itemCode,
    itemName: articulo.itemName,
    descripcion: articulo.descripcion ?? "-",
    unidad: articulo.unidadMedida,
    costo: articulo.costoEstandar,
    grupo: grupoById.get(articulo.grupoId)?.nombre ?? `ID ${articulo.grupoId}`,
    grupoId: articulo.grupoId,
    impuesto: impuestoById.get(articulo.impuestoId)?.nombre ?? `ID ${articulo.impuestoId}`,
    impuestoId: articulo.impuestoId,
    activo: articulo.activo,
  }));

  const ordenes: Order[] = data.ordenes
    .filter((orden) => orden.tipoDocId === PEDIDO_COMPRA_TIPO_DOC_ID)
    .map((orden) => {
      const proveedor = providerById.get(orden.proveedorId);
      const estado = estadoById.get(orden.estadoId);
      const moneda = monedaById.get(orden.monedaId);
      const createdByLabel = usuarioById.get(orden.createdBy) ?? orden.createdBy;
      const approvedByLabel = orden.approvedBy
        ? (usuarioById.get(orden.approvedBy) ?? orden.approvedBy)
        : null;

      return {
        id: orden.id,
        docNum: String(orden.docNum),
        proveedorId: orden.proveedorId,
        proveedor: proveedor?.cardName ?? orden.proveedorId,
        estadoId: orden.estadoId,
        estado: estado?.codigo ?? `ESTADO ${orden.estadoId}`,
        fechaDocumento: orden.fechaDocumento,
        fecha: formatDate(orden.fechaDocumento),
        fechaVencimiento: orden.fechaVencimiento,
        total: orden.totalDocumento,
        subtotal: orden.subtotal,
        descuentoTotal: orden.descuentoTotal,
        impuestosTotal: orden.impuestosTotal,
        moneda: moneda?.codigo ?? `ID ${orden.monedaId}`,
        monedaId: orden.monedaId,
        comentarios: orden.comentarios ?? "",
        createdBy: createdByLabel,
        approvedBy: approvedByLabel ?? undefined,
        lines: orden.detalles.map((detalle) => ({
          id: detalle.id,
          lineNum: detalle.lineNum,
          articuloId: detalle.articuloId,
          almacenId: detalle.almacenId,
          impuestoId: detalle.impuestoId,
          sku: articuloById.get(detalle.articuloId)?.itemCode ?? detalle.articuloId,
          description:
            detalle.descripcion ??
            articuloById.get(detalle.articuloId)?.itemName ??
            detalle.articuloId,
          qty: detalle.cantidadTotal,
          pendingQty: detalle.cantidadPendiente,
          price: detalle.precioUnitario,
          discount: detalle.descuentoLinea,
          lineSubtotal: detalle.subtotalLinea,
          lineTotal: detalle.totalLinea,
        })),
        timeline: [
          {
            date: formatDateTime(orden.fechaDocumento),
            action: "Creacion de orden",
            user: createdByLabel,
            note: orden.comentarios ?? "Sin comentarios",
          },
          ...(approvedByLabel
            ? [
                {
                  date: formatDateTime(orden.fechaDocumento),
                  action: "Aprobacion de orden",
                  user: approvedByLabel,
                  note: "Orden aprobada",
                },
              ]
            : []),
        ],
      };
    });

  const cxp: AccountsPayable[] = data.cuentasPorPagar.map((cuenta) => ({
    id: cuenta.id,
    compraId: cuenta.compraId,
    proveedorId: cuenta.proveedorId,
    proveedor: providerById.get(cuenta.proveedorId)?.cardName ?? cuenta.proveedorId,
    factura: cuenta.numeroFactura,
    total: cuenta.montoTotal,
    saldo: cuenta.saldoPendiente,
    vencimiento: formatDate(cuenta.fechaVencimiento),
    estado: cuenta.estado,
  }));

  const pagos: Payment[] = data.pagosProveedor.map((pago) => ({
    id: pago.id,
    cuentaPorPagarId: pago.cuentaPorPagarId,
    proveedorId: pago.proveedorId,
    proveedor: providerById.get(pago.proveedorId)?.cardName ?? pago.proveedorId,
    monto: pago.monto,
    fecha: formatDateTime(pago.fechaPago),
    referencia: pago.referencia ?? "-",
    usuario: usuarioById.get(pago.createdBy) ?? pago.createdBy,
  }));

  const inventario = data.inventarioStocks.map((stock) => ({
    id: stock.id,
    articuloId: stock.articuloId,
    almacenId: stock.almacenId,
    sku: articuloById.get(stock.articuloId)?.itemCode ?? stock.articuloId,
    nombre: articuloById.get(stock.articuloId)?.itemName ?? stock.articuloId,
    almacen: almacenById.get(stock.almacenId)?.nombre ?? stock.almacenId,
    fisico: stock.stockFisico,
    comprometido: stock.comprometido,
    solicitado: stock.solicitado,
    disponible: stock.stockDisponible,
  }));

  const movimientos: Movement[] = data.inventarioMovimientos.map((movimiento) => ({
    id: movimiento.id,
    articuloId: movimiento.articuloId,
    almacenId: movimiento.almacenId,
    docReferenciaId: movimiento.docReferenciaId,
    fecha: formatDateTime(movimiento.fecha),
    sku: articuloById.get(movimiento.articuloId)?.itemCode ?? movimiento.articuloId,
    almacen: almacenById.get(movimiento.almacenId)?.nombre ?? movimiento.almacenId,
    tipo: movimiento.tipoMovimiento === "IN" ? "ENT" : "SAL",
    cant: movimiento.cantidad,
    ref: movimiento.docReferenciaId,
    comentario: movimiento.comentario ?? "-",
    costoMomento: movimiento.costoMomento,
    usuario: usuarioById.get(movimiento.usuarioId) ?? movimiento.usuarioId,
  }));

  const auditoria = data.auditoriaEventos.map((evento) => ({
    id: evento.id,
    fecha: formatDateTime(evento.fecha),
    usuario: usuarioById.get(evento.usuarioId) ?? evento.usuarioId,
    entidad: evento.entidad,
    entidadId: evento.entidadId,
    accion: evento.accion,
    dataAntes: evento.datosAntes,
    dataDespues: evento.datosDespues,
    ipOrigen: evento.ipOrigen,
  }));

  return {
    users,
    proveedores,
    articulos,
    ordenes,
    cxp,
    pagos,
    inventario,
    movimientos,
    auditoria,
  };
};

const calculateDashboardMetrics = (data: ERPApiData): Metric[] => {
  const hoy = todayIsoDate();
  const estadoById = new Map(data.catalogos.estadosDocumento.map((estado) => [estado.id, estado.codigo]));

  const ordenesCompra = data.ordenes.filter((orden) => orden.tipoDocId === PEDIDO_COMPRA_TIPO_DOC_ID);
  const recepcionesHoy = data.ordenes.filter(
    (orden) => orden.tipoDocId === ENTRADA_MERCADERIA_TIPO_DOC_ID && orden.fechaDocumento.slice(0, 10) === hoy,
  );

  const ordenesAbiertas = ordenesCompra.filter((orden) => {
    const estadoCodigo = estadoById.get(orden.estadoId);
    return estadoCodigo === "BORRADOR" || estadoCodigo === "APROBADO" || estadoCodigo === "ABIERTO";
  });

  const saldoPendienteTotal = data.cuentasPorPagar.reduce(
    (accumulator, cuenta) => accumulator + cuenta.saldoPendiente,
    0,
  );

  const haceSieteDias = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const pagosUltimaSemana = data.pagosProveedor.filter((pago) => {
    const fecha = new Date(pago.fechaPago).getTime();
    return !Number.isNaN(fecha) && fecha >= haceSieteDias;
  });
  const montoPagosUltimaSemana = pagosUltimaSemana.reduce(
    (accumulator, pago) => accumulator + pago.monto,
    0,
  );

  return [
    {
      label: "Ordenes abiertas",
      value: `${ordenesAbiertas.length}`,
      hint: `Total de ordenes en BORRADOR/APROBADO/ABIERTO`,
    },
    {
      label: "Recepciones hoy",
      value: `${recepcionesHoy.length}`,
      hint: `Documentos de entrada registrados hoy`,
    },
    {
      label: "CxP pendiente",
      value: `Bs ${formatCurrencyAmount(saldoPendienteTotal)}`,
      hint: `Saldo acumulado por pagar`,
    },
    {
      label: "Pagos 7 dias",
      value: `Bs ${formatCurrencyAmount(montoPagosUltimaSemana)}`,
      hint: `${pagosUltimaSemana.length} pagos en la ultima semana`,
    },
  ];
};

export const mapERPApiDataToDashboardMetrics = (data: ERPApiData): Metric[] =>
  calculateDashboardMetrics(data);

export const roleCodeFromUsuario = (
  usuario: UsuarioApi,
  roles: RolCatalogoApi[],
): UserRole => roleFromId(usuario.rolId, roles);
