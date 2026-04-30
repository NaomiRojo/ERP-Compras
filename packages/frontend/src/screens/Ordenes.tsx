import { useEffect, useMemo, useState } from "react";

import { OrderEditor } from "../components/Orders/OrderEditor";
import { OrderDetail } from "../components/Orders/OrderDetail";
import { OrdersTable } from "../components/Orders/OrdersTable";
import { ReceiptEditor } from "../components/Orders/ReceiptEditor";
import type { Article, Order, Provider } from "../types";
import type {
  ActualizarOrdenCompraDto,
  AlmacenApi,
  CrearOrdenCompraDto,
  ImpuestoApi,
  MonedaApi,
  RegistrarRecepcionOrdenCompraDto,
} from "../types/api";
import {
  hasValidationErrors,
  isValidDateInputValue,
  parseNumberInput,
} from "../utils/validation";

type OrdenesScreenProps = {
  ordenes: Order[];
  proveedores: Provider[];
  articulos: Article[];
  almacenes: AlmacenApi[];
  impuestos: ImpuestoApi[];
  monedas: MonedaApi[];
  canManage: boolean;
  canApprove: boolean;
  canReceive: boolean;
  onCreate: (payload: CrearOrdenCompraDto) => Promise<void>;
  onUpdate: (ordenId: string, payload: ActualizarOrdenCompraDto) => Promise<void>;
  onDelete: (ordenId: string) => Promise<void>;
  onApprove: (ordenId: string) => Promise<void>;
  onReceive: (ordenId: string, payload: RegistrarRecepcionOrdenCompraDto) => Promise<void>;
};

type ScreenMode = "list" | "detail" | "create" | "edit" | "receive";

export type OrderFormLineState = {
  articuloId: string;
  almacenId: string;
  impuestoId: number;
  descripcion: string;
  cantidadTotal: string;
  precioUnitario: string;
  descuentoLinea: string;
};

export type OrderFormState = {
  proveedorId: string;
  monedaId: number;
  fechaDocumento: string;
  fechaVencimiento: string;
  comentarios: string;
  detalles: OrderFormLineState[];
};

export type ReceiptFormLineState = {
  lineNum: number;
  sku: string;
  descripcion: string;
  almacen: string;
  cantidadPendiente: number;
  cantidadRecibida: string;
  precioUnitario: number;
};

export type ReceiptFormState = {
  fechaDocumento: string;
  comentarios: string;
  detalles: ReceiptFormLineState[];
};

export type OrderField =
  | "proveedorId"
  | "monedaId"
  | "fechaDocumento"
  | "fechaVencimiento"
  | "comentarios"
  | "detalles";
export type OrderLineField =
  | "articuloId"
  | "almacenId"
  | "impuestoId"
  | "descripcion"
  | "cantidadTotal"
  | "precioUnitario"
  | "descuentoLinea";
export type ReceiptField = "fechaDocumento" | "comentarios" | "detalles";

export type OrderFieldErrors = Partial<Record<OrderField, string>>;
type OrderLineErrors = Partial<Record<number, Partial<Record<OrderLineField, string>>>>;
type ReceiptFieldErrors = Partial<Record<ReceiptField, string>>;
type ReceiptLineErrors = Partial<Record<number, { cantidadRecibida?: string }>>;

type OrderValidationResult = {
  fieldErrors: OrderFieldErrors;
  lineErrors: OrderLineErrors;
};

type ReceiptValidationResult = {
  fieldErrors: ReceiptFieldErrors;
  lineErrors: ReceiptLineErrors;
};

export const FORM_VALIDATION_MESSAGE = "Corrige los campos marcados para continuar.";

export const todayInputValue = (): string => new Date().toISOString().slice(0, 10);

export const toDateInputValue = (value?: string): string => {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
};

export const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const parseDecimal = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const validateOrderForm = (
  form: OrderFormState,
  proveedores: Provider[],
  monedas: MonedaApi[],
): OrderValidationResult => {
  const fieldErrors: OrderFieldErrors = {};
  const lineErrors: OrderLineErrors = {};

  if (!proveedores.some((provider) => provider.id === form.proveedorId)) {
    fieldErrors.proveedorId = "Selecciona un proveedor valido.";
  }

  if (!monedas.some((currency) => currency.id === form.monedaId)) {
    fieldErrors.monedaId = "Selecciona una moneda valida.";
  }

  if (!form.fechaDocumento) {
    fieldErrors.fechaDocumento = "Ingresa la fecha del documento.";
  } else if (!isValidDateInputValue(form.fechaDocumento)) {
    fieldErrors.fechaDocumento = "Ingresa una fecha valida.";
  }

  if (form.fechaVencimiento && !isValidDateInputValue(form.fechaVencimiento)) {
    fieldErrors.fechaVencimiento = "Ingresa una fecha de vencimiento valida.";
  } else if (
    form.fechaDocumento &&
    form.fechaVencimiento &&
    isValidDateInputValue(form.fechaDocumento) &&
    isValidDateInputValue(form.fechaVencimiento) &&
    form.fechaVencimiento < form.fechaDocumento
  ) {
    fieldErrors.fechaVencimiento = "La fecha de vencimiento no puede ser anterior al documento.";
  }

  if (form.comentarios.trim().length > 250) {
    fieldErrors.comentarios = "No excedas 250 caracteres.";
  }

  if (form.detalles.length === 0) {
    fieldErrors.detalles = "Agrega al menos una linea.";
  }

  form.detalles.forEach((line, index) => {
    const currentErrors: Partial<Record<OrderLineField, string>> = {};
    const cantidadTotal = parseNumberInput(line.cantidadTotal);
    const precioUnitario = parseNumberInput(line.precioUnitario);
    const descuentoLinea = parseNumberInput(line.descuentoLinea);

    if (!line.articuloId) {
      currentErrors.articuloId = "Selecciona un articulo.";
    }

    if (!line.almacenId) {
      currentErrors.almacenId = "Selecciona un almacen.";
    }

    if (!Number.isFinite(line.impuestoId) || line.impuestoId <= 0) {
      currentErrors.impuestoId = "Selecciona un impuesto valido.";
    }

    if (line.descripcion.trim().length > 160) {
      currentErrors.descripcion = "No excedas 160 caracteres.";
    }

    if (cantidadTotal === null || cantidadTotal <= 0) {
      currentErrors.cantidadTotal = "La cantidad debe ser mayor a 0.";
    }

    if (precioUnitario === null || precioUnitario < 0) {
      currentErrors.precioUnitario = "Ingresa un precio valido.";
    }

    if (descuentoLinea === null || descuentoLinea < 0) {
      currentErrors.descuentoLinea = "Ingresa un descuento valido.";
    }

    if (
      cantidadTotal !== null &&
      cantidadTotal > 0 &&
      precioUnitario !== null &&
      precioUnitario >= 0 &&
      descuentoLinea !== null &&
      descuentoLinea > cantidadTotal * precioUnitario
    ) {
      currentErrors.descuentoLinea = "El descuento no puede exceder la base de la linea.";
    }

    if (hasValidationErrors(currentErrors)) {
      lineErrors[index] = currentErrors;
    }
  });

  if (!fieldErrors.detalles && Object.keys(lineErrors).length > 0) {
    fieldErrors.detalles = "Corrige las lineas marcadas.";
  }

  return { fieldErrors, lineErrors };
};

export const validateReceiptForm = (form: ReceiptFormState): ReceiptValidationResult => {
  const fieldErrors: ReceiptFieldErrors = {};
  const lineErrors: ReceiptLineErrors = {};
  let hasReceivableQuantity = false;

  if (!form.fechaDocumento) {
    fieldErrors.fechaDocumento = "Ingresa la fecha de recepcion.";
  } else if (!isValidDateInputValue(form.fechaDocumento)) {
    fieldErrors.fechaDocumento = "Ingresa una fecha valida.";
  }

  if (form.comentarios.trim().length > 250) {
    fieldErrors.comentarios = "No excedas 250 caracteres.";
  }

  form.detalles.forEach((line) => {
    const cantidadRecibida = parseNumberInput(line.cantidadRecibida);

    if (cantidadRecibida === null || cantidadRecibida < 0) {
      lineErrors[line.lineNum] = {
        cantidadRecibida: "Ingresa una cantidad valida.",
      };
      return;
    }

    if (cantidadRecibida > line.cantidadPendiente) {
      lineErrors[line.lineNum] = {
        cantidadRecibida: "No puede exceder la cantidad pendiente.",
      };
      return;
    }

    if (cantidadRecibida > 0) {
      hasReceivableQuantity = true;
    }
  });

  if (!hasReceivableQuantity) {
    fieldErrors.detalles = "Ingresa al menos una linea con cantidad recibida mayor a 0.";
  }

  return { fieldErrors, lineErrors };
};

export const buildDefaultLine = (
  articulos: Article[],
  almacenes: AlmacenApi[],
  impuestos: ImpuestoApi[],
): OrderFormLineState => ({
  articuloId: articulos[0]?.id ?? "",
  almacenId: almacenes[0]?.id ?? "",
  impuestoId: articulos[0]?.impuestoId ?? impuestos[0]?.id ?? 1,
  descripcion: articulos[0]?.itemName ?? "",
  cantidadTotal: "1",
  precioUnitario: articulos[0] ? String(articulos[0].costo) : "0",
  descuentoLinea: "0",
});

export const buildEmptyOrderForm = (
  proveedores: Provider[],
  articulos: Article[],
  almacenes: AlmacenApi[],
  impuestos: ImpuestoApi[],
  monedas: MonedaApi[],
): OrderFormState => ({
  proveedorId: proveedores[0]?.id ?? "",
  monedaId: proveedores[0]?.monedaId ?? monedas[0]?.id ?? 1,
  fechaDocumento: todayInputValue(),
  fechaVencimiento: "",
  comentarios: "",
  detalles: [buildDefaultLine(articulos, almacenes, impuestos)],
});

export const buildOrderFormFromOrder = (order: Order): OrderFormState => ({
  proveedorId: order.proveedorId,
  monedaId: order.monedaId,
  fechaDocumento: toDateInputValue(order.fechaDocumento),
  fechaVencimiento: toDateInputValue(order.fechaVencimiento),
  comentarios: order.comentarios,
  detalles: order.lines.map((line) => ({
    articuloId: line.articuloId,
    almacenId: line.almacenId,
    impuestoId: line.impuestoId,
    descripcion: line.description,
    cantidadTotal: String(line.qty),
    precioUnitario: String(line.price),
    descuentoLinea: String(line.discount),
  })),
});

export const buildReceiptFormFromOrder = (order: Order): ReceiptFormState => ({
  fechaDocumento: todayInputValue(),
  comentarios: "",
  detalles: order.lines
    .filter((line) => line.pendingQty > 0)
    .map((line) => ({
      lineNum: line.lineNum,
      sku: line.sku,
      descripcion: line.description,
      almacen: line.almacenId,
      cantidadPendiente: line.pendingQty,
      cantidadRecibida: String(line.pendingQty),
      precioUnitario: line.price,
    })),
});

export const formatCurrency = (currency: string, amount: number): string =>
  `${currency} ${amount.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const isDraftOrder = (order: Order): boolean => order.estado === "BORRADOR";
export const isReceivableOrder = (order: Order): boolean =>
  (order.estado === "APROBADO" || order.estado === "ABIERTO") &&
  order.lines.some((line) => line.pendingQty > 0);

const readInitialSearchTerm = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const hashQuery = window.location.hash.split("?")[1] ?? "";
  const params = new URLSearchParams(hashQuery || window.location.search);
  return params.get("q") ?? "";
};

export function OrdenesScreen({
  ordenes,
  proveedores,
  articulos,
  almacenes,
  impuestos,
  monedas,
  canManage,
  canApprove,
  canReceive,
  onCreate,
  onUpdate,
  onDelete,
  onApprove,
  onReceive,
}: OrdenesScreenProps) {
  const initialSearchTerm = readInitialSearchTerm();
  const [mode, setMode] = useState<ScreenMode>("list");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderValidationActive, setOrderValidationActive] = useState(false);
  const [receiptValidationActive, setReceiptValidationActive] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderFormState>(() =>
    buildEmptyOrderForm(proveedores, articulos, almacenes, impuestos, monedas),
  );
  const [receiptForm, setReceiptForm] = useState<ReceiptFormState>({
    fechaDocumento: todayInputValue(),
    comentarios: "",
    detalles: [],
  });

  const selectedOrder = useMemo(
    () => ordenes.find((order) => order.id === selectedOrderId) ?? null,
    [ordenes, selectedOrderId],
  );

  const providerById = useMemo(
    () => new Map(proveedores.map((provider) => [provider.id, provider])),
    [proveedores],
  );
  const articleById = useMemo(
    () => new Map(articulos.map((article) => [article.id, article])),
    [articulos],
  );
  const taxRateById = useMemo(
    () => new Map(impuestos.map((tax) => [tax.id, tax.porcentaje])),
    [impuestos],
  );
  const warehouseById = useMemo(
    () => new Map(almacenes.map((warehouse) => [warehouse.id, warehouse])),
    [almacenes],
  );
  const orderValidation = useMemo(
    () => validateOrderForm(orderForm, proveedores, monedas),
    [monedas, orderForm, proveedores],
  );
  const receiptValidation = useMemo(() => validateReceiptForm(receiptForm), [receiptForm]);

  useEffect(() => {
    if (errorMessage === FORM_VALIDATION_MESSAGE) {
      setErrorMessage(null);
    }
  }, [errorMessage, orderForm, receiptForm]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) {
      return ordenes;
    }

    return ordenes.filter((order) =>
      [
        `OC-${order.docNum}`,
        order.docNum,
        order.proveedor,
        order.estado,
        order.comentarios,
        ...order.lines.map((line) => `${line.sku} ${line.description}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [ordenes, searchTerm]);

  const orderPreview = useMemo(() => {
    let subtotal = 0;
    let descuentoTotal = 0;
    let impuestosTotal = 0;
    let totalDocumento = 0;

    for (const detalle of orderForm.detalles) {
      const cantidad = parseDecimal(detalle.cantidadTotal);
      const precio = parseDecimal(detalle.precioUnitario);
      const descuento = parseDecimal(detalle.descuentoLinea);
      const porcentajeImpuesto = taxRateById.get(detalle.impuestoId) ?? 0;
      const subtotalLinea = roundMoney(cantidad * precio);
      const base = roundMoney(Math.max(subtotalLinea - descuento, 0));
      const impuesto = roundMoney((base * porcentajeImpuesto) / 100);
      const totalLinea = roundMoney(base + impuesto);

      subtotal = roundMoney(subtotal + subtotalLinea);
      descuentoTotal = roundMoney(descuentoTotal + descuento);
      impuestosTotal = roundMoney(impuestosTotal + impuesto);
      totalDocumento = roundMoney(totalDocumento + totalLinea);
    }

    return { subtotal, descuentoTotal, impuestosTotal, totalDocumento };
  }, [orderForm.detalles, taxRateById]);

  const resetOrderEditor = () => {
    setOrderForm(buildEmptyOrderForm(proveedores, articulos, almacenes, impuestos, monedas));
    setOrderValidationActive(false);
    setMode("list");
    setSelectedOrderId(null);
    setErrorMessage(null);
  };

  const resetReceiptEditor = () => {
    setReceiptForm({ fechaDocumento: todayInputValue(), comentarios: "", detalles: [] });
    setReceiptValidationActive(false);
    setMode("list");
    setSelectedOrderId(null);
    setErrorMessage(null);
  };

  const openDetail = (order: Order) => {
    setSelectedOrderId(order.id);
    setOrderValidationActive(false);
    setReceiptValidationActive(false);
    setMode("detail");
    setErrorMessage(null);
  };

  const startCreate = () => {
    setOrderForm(buildEmptyOrderForm(proveedores, articulos, almacenes, impuestos, monedas));
    setSelectedOrderId(null);
    setOrderValidationActive(false);
    setMode("create");
    setErrorMessage(null);
  };

  const startEdit = (order: Order) => {
    setOrderForm(buildOrderFormFromOrder(order));
    setSelectedOrderId(order.id);
    setOrderValidationActive(false);
    setMode("edit");
    setErrorMessage(null);
  };

  const startReceive = (order: Order) => {
    setReceiptForm(buildReceiptFormFromOrder(order));
    setSelectedOrderId(order.id);
    setReceiptValidationActive(false);
    setMode("receive");
    setErrorMessage(null);
  };

  const updateOrderLine = (
    index: number,
    updater: (currentLine: OrderFormLineState) => OrderFormLineState,
  ) => {
    setOrderForm((current) => ({
      ...current,
      detalles: current.detalles.map((line, lineIndex) =>
        lineIndex === index ? updater(line) : line,
      ),
    }));
  };

  const addOrderLine = () => {
    setOrderForm((current) => ({
      ...current,
      detalles: [...current.detalles, buildDefaultLine(articulos, almacenes, impuestos)],
    }));
  };

  const removeOrderLine = (index: number) => {
    setOrderForm((current) => ({
      ...current,
      detalles:
        current.detalles.length > 1
          ? current.detalles.filter((_, lineIndex) => lineIndex !== index)
          : current.detalles,
    }));
  };

  const syncArticleOnLine = (index: number, articuloId: string) => {
    updateOrderLine(index, (currentLine) => {
      const article = articleById.get(articuloId);
      return {
        ...currentLine,
        articuloId,
        impuestoId: article?.impuestoId ?? currentLine.impuestoId,
        descripcion: article?.itemName ?? currentLine.descripcion,
        precioUnitario: article ? String(article.costo) : currentLine.precioUnitario,
      };
    });
  };

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOrderValidationActive(true);
    setErrorMessage(null);

    const nextOrderValidation = validateOrderForm(orderForm, proveedores, monedas);

    if (
      hasValidationErrors(nextOrderValidation.fieldErrors) ||
      Object.keys(nextOrderValidation.lineErrors).length > 0
    ) {
      setErrorMessage(FORM_VALIDATION_MESSAGE);
      return;
    }

    setIsSubmitting(true);

    try {
      const detalles = orderForm.detalles.map((line) => {
        const cantidadTotal = parseDecimal(line.cantidadTotal);
        const precioUnitario = parseDecimal(line.precioUnitario);
        const descuentoLinea = parseDecimal(line.descuentoLinea);

        if (!line.articuloId || !line.almacenId) {
          throw new Error("Cada linea debe tener articulo y almacen");
        }

        if (cantidadTotal <= 0) {
          throw new Error("Cada linea debe tener una cantidad mayor a cero");
        }

        if (precioUnitario < 0 || descuentoLinea < 0) {
          throw new Error("Precio y descuento no pueden ser negativos");
        }

        return {
          articuloId: line.articuloId,
          almacenId: line.almacenId,
          impuestoId: line.impuestoId,
          descripcion: line.descripcion.trim() || undefined,
          cantidadTotal,
          precioUnitario,
          descuentoLinea,
        };
      });

      const payload: CrearOrdenCompraDto = {
        proveedorId: orderForm.proveedorId,
        monedaId: orderForm.monedaId,
        fechaDocumento: new Date(orderForm.fechaDocumento).toISOString(),
        fechaVencimiento: orderForm.fechaVencimiento
          ? new Date(orderForm.fechaVencimiento).toISOString()
          : undefined,
        comentarios: orderForm.comentarios.trim() || undefined,
        detalles,
      };

      if (mode === "edit" && selectedOrderId) {
        await onUpdate(selectedOrderId, payload);
        setMode("detail");
      } else {
        await onCreate(payload);
        setMode("list");
        setSelectedOrderId(null);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar la orden");
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveOrder = async (order: Order) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onApprove(order.id);
      setSelectedOrderId(order.id);
      setMode("detail");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo aprobar la orden");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteOrder = async (order: Order) => {
    if (!window.confirm(`Eliminar la orden OC-${order.docNum}?`)) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onDelete(order.id);
      setSelectedOrderId(null);
      setMode("list");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar la orden");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReceipt = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReceiptValidationActive(true);
    if (!selectedOrderId) {
      setErrorMessage("Selecciona una orden para registrar la recepcion");
      return;
    }

    setErrorMessage(null);

    const nextReceiptValidation = validateReceiptForm(receiptForm);

    if (
      hasValidationErrors(nextReceiptValidation.fieldErrors) ||
      Object.keys(nextReceiptValidation.lineErrors).length > 0
    ) {
      setErrorMessage(FORM_VALIDATION_MESSAGE);
      return;
    }

    setIsSubmitting(true);

    try {
      const detalles = receiptForm.detalles
        .map((line) => ({
          lineNum: line.lineNum,
          cantidadRecibida: parseDecimal(line.cantidadRecibida),
        }))
        .filter((line) => line.cantidadRecibida > 0);

      if (detalles.length === 0) {
        throw new Error("Ingresa al menos una linea con cantidad recibida");
      }

      for (const detalle of detalles) {
        const original = receiptForm.detalles.find((line) => line.lineNum === detalle.lineNum);
        if (!original) {
          continue;
        }

        if (detalle.cantidadRecibida > original.cantidadPendiente) {
          throw new Error(`La linea ${detalle.lineNum} excede la cantidad pendiente`);
        }
      }

      await onReceive(selectedOrderId, {
        fechaDocumento: new Date(receiptForm.fechaDocumento).toISOString(),
        comentarios: receiptForm.comentarios.trim() || undefined,
        detalles,
      });

      setMode("detail");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo registrar la recepcion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCurrency =
    monedas.find((currency) => currency.id === orderForm.monedaId)?.codigo ?? "Bs";

  const showOrderFieldError = (field: OrderField): string | undefined =>
    orderValidationActive ? orderValidation.fieldErrors[field] : undefined;
  const showOrderLineError = (index: number, field: OrderLineField): string | undefined =>
    orderValidationActive ? orderValidation.lineErrors[index]?.[field] : undefined;
  const showReceiptFieldError = (field: ReceiptField): string | undefined =>
    receiptValidationActive ? receiptValidation.fieldErrors[field] : undefined;
  const showReceiptLineError = (lineNum: number): string | undefined =>
    receiptValidationActive ? receiptValidation.lineErrors[lineNum]?.cantidadRecibida : undefined;

  return (
    <div className="stack">
      <OrdersTable
        canApprove={canApprove}
        canManage={canManage}
        canReceive={canReceive}
        formatAmount={formatCurrency}
        isDraftOrder={isDraftOrder}
        isReceivableOrder={isReceivableOrder}
        isSubmitting={isSubmitting}
        onApprove={(order) => {
          void approveOrder(order);
        }}
        onCreate={startCreate}
        onDelete={(order) => {
          void deleteOrder(order);
        }}
        onEdit={startEdit}
        onOpenDetail={openDetail}
        onReceive={startReceive}
        onSearchTermChange={setSearchTerm}
        orders={filteredOrders}
        searchTerm={searchTerm}
      />

      {errorMessage && mode !== "create" && mode !== "edit" && mode !== "receive" ? (
        <section className="panel">
          <p className="auth-feedback auth-feedback--error">{errorMessage}</p>
        </section>
      ) : null}

      {selectedOrder && mode === "detail" ? (
        <OrderDetail
          actions={
            <div className="action-row">
              {canManage && isDraftOrder(selectedOrder) ? (
                <button className="secondary-button" onClick={() => startEdit(selectedOrder)} type="button">
                  Editar
                </button>
              ) : null}
              {canApprove && isDraftOrder(selectedOrder) ? (
                <button
                  className="primary-button"
                  disabled={isSubmitting}
                  onClick={() => {
                    void approveOrder(selectedOrder);
                  }}
                  type="button"
                >
                  Aprobar
                </button>
              ) : null}
              {canReceive && isReceivableOrder(selectedOrder) ? (
                <button className="primary-button" onClick={() => startReceive(selectedOrder)} type="button">
                  Registrar recepcion
                </button>
              ) : null}
            </div>
          }
          onBack={() => {
            setMode("list");
            setSelectedOrderId(null);
            setErrorMessage(null);
          }}
          order={selectedOrder}
        />
      ) : null}

      {(mode === "create" || mode === "edit") ? (
        <OrderEditor
          almacenes={almacenes}
          articulos={articulos}
          currentCurrency={currentCurrency}
          errorMessage={errorMessage}
          form={orderForm}
          formatAmount={formatCurrency}
          impuestos={impuestos}
          isSubmitting={isSubmitting}
          mode={mode}
          monedas={monedas}
          onAddLine={addOrderLine}
          onCancel={resetOrderEditor}
          onFieldChange={(field, value) => {
            setOrderForm((current) => ({ ...current, [field]: value }));
          }}
          onProviderChange={(proveedorId) =>
            setOrderForm((current) => {
              const provider = providerById.get(proveedorId);
              return {
                ...current,
                proveedorId,
                monedaId: provider?.monedaId ?? current.monedaId,
              };
            })
          }
          onRemoveLine={removeOrderLine}
          onSubmit={submitOrder}
          onSyncArticle={syncArticleOnLine}
          onUpdateLine={(index, field, value) =>
            updateOrderLine(index, (currentLine) => ({
              ...currentLine,
              [field]: value,
            }))
          }
          orderPreview={orderPreview}
          proveedores={proveedores}
          showFieldError={showOrderFieldError}
          showLineError={showOrderLineError}
        />
      ) : null}

      {selectedOrder && mode === "receive" ? (
        <ReceiptEditor
          currencyCode={selectedOrder.moneda}
          errorMessage={errorMessage}
          form={receiptForm}
          formatAmount={formatCurrency}
          isSubmitting={isSubmitting}
          onCancel={resetReceiptEditor}
          onCommentsChange={(comentarios) =>
            setReceiptForm((current) => ({ ...current, comentarios }))
          }
          onDateChange={(fechaDocumento) =>
            setReceiptForm((current) => ({ ...current, fechaDocumento }))
          }
          onLineQuantityChange={(lineNum, cantidadRecibida) =>
            setReceiptForm((current) => ({
              ...current,
              detalles: current.detalles.map((detail) =>
                detail.lineNum === lineNum ? { ...detail, cantidadRecibida } : detail,
              ),
            }))
          }
          onSubmit={submitReceipt}
          orderDocNum={selectedOrder.docNum}
          resolveWarehouseName={(warehouseId) =>
            warehouseById.get(warehouseId)?.nombre ?? warehouseId
          }
          showFieldError={showReceiptFieldError}
          showLineError={showReceiptLineError}
        />
      ) : null}
    </div>
  );
}
