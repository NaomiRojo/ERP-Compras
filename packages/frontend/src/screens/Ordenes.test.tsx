import { describe, expect, it } from "bun:test";

import type { Article, Order, Provider } from "../types";
import type { AlmacenApi, ImpuestoApi, MonedaApi } from "../types/api";
import {
  buildDefaultLine,
  buildEmptyOrderForm,
  buildOrderFormFromOrder,
  buildReceiptFormFromOrder,
  formatCurrency,
  isDraftOrder,
  isReceivableOrder,
  parseDecimal,
  roundMoney,
  toDateInputValue,
  todayInputValue,
  validateOrderForm,
  validateReceiptForm,
} from "./Ordenes";

const proveedores: Provider[] = [
  {
    id: "prov-1",
    cardCode: "PR-001",
    cardName: "Proveedor Uno",
    nombreComercial: "Proveedor Uno SRL",
    nitRut: "1234567",
    email: "contacto@proveedor.test",
    telefono: "77777777",
    direccion: "Av. Principal 123",
    moneda: "Bs",
    monedaId: 1,
    lineaCredito: 5000,
    balance: 1200,
    activo: true,
  },
];

const articulos: Article[] = [
  {
    id: "art-1",
    itemCode: "SKU-001",
    itemName: "Articulo Uno",
    descripcion: "Descripcion base",
    unidad: "UNI",
    costo: 25,
    grupo: "Materiales",
    grupoId: 1,
    impuesto: "IVA 13%",
    impuestoId: 1,
    activo: true,
  },
];

const almacenes: AlmacenApi[] = [
  {
    id: "alm-1",
    nombre: "Principal",
    ubicacion: "Planta 1",
    activo: true,
  },
];

const impuestos: ImpuestoApi[] = [
  {
    id: 1,
    taxCode: "IVA",
    nombre: "IVA 13%",
    porcentaje: 13,
    activo: true,
  },
];

const monedas: MonedaApi[] = [
  {
    id: 1,
    codigo: "Bs",
    nombre: "Boliviano",
    tasaActual: 1,
  },
];

const proveedor = proveedores[0]!;
const articulo = articulos[0]!;
const almacen = almacenes[0]!;
const impuesto = impuestos[0]!;
const moneda = monedas[0]!;
const orden: Order = {
  id: "ord-1",
  docNum: "1001",
  proveedorId: proveedor.id,
  proveedor: proveedor.cardName,
  estadoId: 1,
  estado: "BORRADOR",
  fechaDocumento: "2026-04-20T00:00:00.000Z",
  fecha: "20/04/2026",
  fechaVencimiento: "2026-04-25T00:00:00.000Z",
  total: 113,
  subtotal: 100,
  descuentoTotal: 0,
  impuestosTotal: 13,
  moneda: moneda.codigo,
  monedaId: moneda.id,
  comentarios: "Orden de prueba",
  createdBy: "admin",
  lines: [
    {
      id: "line-1",
      lineNum: 1,
      articuloId: articulo.id,
      almacenId: almacen.id,
      impuestoId: impuesto.id,
      sku: articulo.itemCode,
      description: articulo.itemName,
      qty: 2,
      pendingQty: 1,
      price: 50,
      discount: 0,
      lineSubtotal: 100,
      lineTotal: 113,
    },
  ],
  timeline: [
    {
      date: "20/04/2026 08:00",
      action: "Creada",
      user: "admin",
      note: "Documento inicial",
    },
  ],
};

describe("OrdenesScreen", () => {
  it("marca error cuando una linea tiene cantidad invalida", () => {
    const validation = validateOrderForm(
      {
        proveedorId: proveedor.id,
        monedaId: moneda.id,
        fechaDocumento: "2026-04-20",
        fechaVencimiento: "2026-04-21",
        comentarios: "",
        detalles: [
          {
            articuloId: articulo.id,
            almacenId: almacen.id,
            impuestoId: impuesto.id,
            descripcion: articulo.itemName,
            cantidadTotal: "0",
            precioUnitario: "25",
            descuentoLinea: "0",
          },
        ],
      },
      proveedores,
      monedas,
    );

    expect(validation.fieldErrors.detalles).toBe("Corrige las lineas marcadas.");
    expect(validation.lineErrors[0]?.cantidadTotal).toBe("La cantidad debe ser mayor a 0.");
  });

  it("marca error cuando la fecha de vencimiento es anterior a la del documento", () => {
    const validation = validateOrderForm(
      {
        proveedorId: proveedor.id,
        monedaId: moneda.id,
        fechaDocumento: "2026-04-20",
        fechaVencimiento: "2026-04-19",
        comentarios: "",
        detalles: [
          {
            articuloId: articulo.id,
            almacenId: almacen.id,
            impuestoId: impuesto.id,
            descripcion: articulo.itemName,
            cantidadTotal: "1",
            precioUnitario: "25",
            descuentoLinea: "0",
          },
        ],
      },
      proveedores,
      monedas,
    );

    expect(validation.fieldErrors.fechaVencimiento).toBe(
      "La fecha de vencimiento no puede ser anterior al documento.",
    );
  });

  it("cubre errores compuestos en la validacion de ordenes", () => {
    const validation = validateOrderForm(
      {
        proveedorId: "desconocido",
        monedaId: 999,
        fechaDocumento: "2026-04-99",
        fechaVencimiento: "2026-04-00",
        comentarios: "x".repeat(251),
        detalles: [
          {
            articuloId: "",
            almacenId: "",
            impuestoId: 0,
            descripcion: "x".repeat(161),
            cantidadTotal: "",
            precioUnitario: "-1",
            descuentoLinea: "-5",
          },
          {
            articuloId: articulo.id,
            almacenId: almacen.id,
            impuestoId: impuesto.id,
            descripcion: articulo.itemName,
            cantidadTotal: "1",
            precioUnitario: "10",
            descuentoLinea: "20",
          },
        ],
      },
      proveedores,
      monedas,
    );

    expect(validation.fieldErrors.proveedorId).toBe("Selecciona un proveedor valido.");
    expect(validation.fieldErrors.monedaId).toBe("Selecciona una moneda valida.");
    expect(validation.fieldErrors.fechaDocumento).toBe("Ingresa una fecha valida.");
    expect(validation.fieldErrors.fechaVencimiento).toBe("Ingresa una fecha de vencimiento valida.");
    expect(validation.fieldErrors.comentarios).toBe("No excedas 250 caracteres.");
    expect(validation.fieldErrors.detalles).toBe("Corrige las lineas marcadas.");
    expect(validation.lineErrors[0]).toMatchObject({
      articuloId: "Selecciona un articulo.",
      almacenId: "Selecciona un almacen.",
      impuestoId: "Selecciona un impuesto valido.",
      descripcion: "No excedas 160 caracteres.",
      cantidadTotal: "La cantidad debe ser mayor a 0.",
      precioUnitario: "Ingresa un precio valido.",
      descuentoLinea: "Ingresa un descuento valido.",
    });
    expect(validation.lineErrors[1]?.descuentoLinea).toBe(
      "El descuento no puede exceder la base de la linea.",
    );
  });

  it("marca obligatorios faltantes cuando no hay fecha ni lineas en la orden", () => {
    const validation = validateOrderForm(
      {
        proveedorId: proveedor.id,
        monedaId: moneda.id,
        fechaDocumento: "",
        fechaVencimiento: "",
        comentarios: "",
        detalles: [],
      },
      proveedores,
      monedas,
    );

    expect(validation.fieldErrors.fechaDocumento).toBe("Ingresa la fecha del documento.");
    expect(validation.fieldErrors.detalles).toBe("Agrega al menos una linea.");
  });

  it("valida recepciones con fecha, comentarios y cantidades", () => {
    const validation = validateReceiptForm({
      fechaDocumento: "2026-13-01",
      comentarios: "x".repeat(251),
      detalles: [
        {
          lineNum: 1,
          sku: articulo.itemCode,
          descripcion: articulo.itemName,
          almacen: almacen.id,
          cantidadPendiente: 3,
          cantidadRecibida: "-1",
          precioUnitario: 25,
        },
        {
          lineNum: 2,
          sku: articulo.itemCode,
          descripcion: articulo.itemName,
          almacen: almacen.id,
          cantidadPendiente: 2,
          cantidadRecibida: "5",
          precioUnitario: 25,
        },
      ],
    });

    expect(validation.fieldErrors.fechaDocumento).toBe("Ingresa una fecha valida.");
    expect(validation.fieldErrors.comentarios).toBe("No excedas 250 caracteres.");
    expect(validation.fieldErrors.detalles).toBe(
      "Ingresa al menos una linea con cantidad recibida mayor a 0.",
    );
    expect(validation.lineErrors[1]?.cantidadRecibida).toBe("Ingresa una cantidad valida.");
    expect(validation.lineErrors[2]?.cantidadRecibida).toBe(
      "No puede exceder la cantidad pendiente.",
    );
  });

  it("marca obligatoria la fecha de recepcion cuando falta", () => {
    const validation = validateReceiptForm({
      fechaDocumento: "",
      comentarios: "",
      detalles: [],
    });

    expect(validation.fieldErrors.fechaDocumento).toBe("Ingresa la fecha de recepcion.");
    expect(validation.fieldErrors.detalles).toBe(
      "Ingresa al menos una linea con cantidad recibida mayor a 0.",
    );
  });

  it("construye formularios y helpers de orden a partir de los datos base", () => {
    const defaultLine = buildDefaultLine(articulos, almacenes, impuestos);
    expect(defaultLine).toEqual({
      articuloId: articulo.id,
      almacenId: almacen.id,
      impuestoId: articulo.impuestoId,
      descripcion: articulo.itemName,
      cantidadTotal: "1",
      precioUnitario: String(articulo.costo),
      descuentoLinea: "0",
    });

    const emptyForm = buildEmptyOrderForm(proveedores, articulos, almacenes, impuestos, monedas);
    expect(emptyForm.proveedorId).toBe(proveedor.id);
    expect(emptyForm.monedaId).toBe(proveedor.monedaId);
    expect(emptyForm.fechaDocumento).toBe(todayInputValue());
    expect(emptyForm.detalles).toHaveLength(1);

    const formFromOrder = buildOrderFormFromOrder(orden);
    expect(formFromOrder).toMatchObject({
      proveedorId: orden.proveedorId,
      monedaId: orden.monedaId,
      fechaDocumento: "2026-04-20",
      fechaVencimiento: "2026-04-25",
      comentarios: "Orden de prueba",
    });

    const receiptForm = buildReceiptFormFromOrder(orden);
    expect(receiptForm.fechaDocumento).toBe(todayInputValue());
    expect(receiptForm.detalles).toEqual([
      {
        lineNum: 1,
        sku: articulo.itemCode,
        descripcion: articulo.itemName,
        almacen: almacen.id,
        cantidadPendiente: 1,
        cantidadRecibida: "1",
        precioUnitario: 50,
      },
    ]);
  });

  it("resuelve formatos, conversiones y flags de estado", () => {
    expect(toDateInputValue("2026-04-20T00:00:00.000Z")).toBe("2026-04-20");
    expect(toDateInputValue(undefined)).toBe("");
    expect(roundMoney(10.105)).toBe(10.11);
    expect(parseDecimal("42.5")).toBe(42.5);
    expect(parseDecimal("nope")).toBe(0);
    expect(formatCurrency("Bs", 1234.5)).toBe("Bs 1.234,50");
    expect(isDraftOrder(orden)).toBe(true);
    expect(isReceivableOrder({ ...orden, estado: "APROBADO" })).toBe(true);
    expect(
      isReceivableOrder({
        ...orden,
        estado: "CERRADO",
        lines: [{ ...orden.lines[0]!, pendingQty: 0 }],
      }),
    ).toBe(false);
  });
});
