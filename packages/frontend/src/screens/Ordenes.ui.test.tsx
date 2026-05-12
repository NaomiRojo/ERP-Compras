import { describe, expect, it, mock, spyOn } from "bun:test";
import { fireEvent, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Article, Order, Provider } from "../types";
import type { AlmacenApi, ImpuestoApi, MonedaApi } from "../types/api";
import { OrdenesScreen } from "./Ordenes";

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
  {
    id: "prov-2",
    cardCode: "PR-002",
    cardName: "Proveedor Dos",
    nombreComercial: "Proveedor Dos SRL",
    nitRut: "7654321",
    email: "compras@proveedor2.test",
    telefono: "76666666",
    direccion: "Av. Secundaria 456",
    moneda: "USD",
    monedaId: 2,
    lineaCredito: 9000,
    balance: 0,
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
  {
    id: "art-2",
    itemCode: "SKU-002",
    itemName: "Articulo Dos",
    descripcion: "Descripcion secundaria",
    unidad: "CJ",
    costo: 40,
    grupo: "Materiales",
    grupoId: 1,
    impuesto: "IVA 5%",
    impuestoId: 2,
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
  {
    id: "alm-2",
    nombre: "Secundario",
    ubicacion: "Planta 2",
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
  {
    id: 2,
    taxCode: "RED",
    nombre: "IVA 5%",
    porcentaje: 5,
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
  {
    id: 2,
    codigo: "USD",
    nombre: "Dolar",
    tasaActual: 6.96,
  },
];

const draftOrder: Order = {
  id: "ord-1",
  docNum: "1001",
  proveedorId: "prov-1",
  proveedor: "Proveedor Uno",
  estadoId: 1,
  estado: "BORRADOR",
  fechaDocumento: "2026-04-20T00:00:00.000Z",
  fecha: "20/04/2026",
  fechaVencimiento: "2026-04-25T00:00:00.000Z",
  total: 56.5,
  subtotal: 50,
  descuentoTotal: 0,
  impuestosTotal: 6.5,
  moneda: "Bs",
  monedaId: 1,
  comentarios: "Borrador inicial",
  createdBy: "admin",
  lines: [
    {
      id: "line-1",
      lineNum: 1,
      articuloId: "art-1",
      almacenId: "alm-1",
      impuestoId: 1,
      sku: "SKU-001",
      description: "Articulo Uno",
      qty: 2,
      pendingQty: 2,
      price: 25,
      discount: 0,
      lineSubtotal: 50,
      lineTotal: 56.5,
    },
  ],
  timeline: [
    {
      date: "20/04/2026 08:00",
      action: "Creada",
      user: "admin",
      note: "Borrador generado",
    },
  ],
};

const approvedOrder: Order = {
  ...draftOrder,
  id: "ord-2",
  docNum: "1002",
  estado: "APROBADO",
  estadoId: 2,
  approvedBy: "supervisor",
  comentarios: "Lista para recepcion",
  lines: [
    {
      ...draftOrder.lines[0]!,
      id: "line-2",
      pendingQty: 1,
    },
  ],
};

type ScreenOverrides = Partial<React.ComponentProps<typeof OrdenesScreen>>;

const renderScreen = (overrides: ScreenOverrides = {}) => {
  const onCreate = overrides.onCreate ?? mock(async () => undefined);
  const onUpdate = overrides.onUpdate ?? mock(async () => undefined);
  const onDelete = overrides.onDelete ?? mock(async () => undefined);
  const onApprove = overrides.onApprove ?? mock(async () => undefined);
  const onReceive = overrides.onReceive ?? mock(async () => undefined);

  const view = render(
    <OrdenesScreen
      almacenes={almacenes}
      articulos={articulos}
      canApprove
      canManage
      canReceive
      impuestos={impuestos}
      monedas={monedas}
      onApprove={onApprove}
      onCreate={onCreate}
      onDelete={onDelete}
      onReceive={onReceive}
      onUpdate={onUpdate}
      ordenes={overrides.ordenes ?? [draftOrder, approvedOrder]}
      proveedores={proveedores}
      {...overrides}
    />,
  );

  return {
    onApprove,
    onCreate,
    onDelete,
    onReceive,
    onUpdate,
    view,
  };
};

describe("OrdenesScreen UI", () => {
  it("crea una orden con el payload esperado", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const { onCreate, view } = renderScreen({ ordenes: [] });

    await user.click(view.getByRole("button", { name: "Nueva orden" }));
    await user.click(view.getByRole("button", { name: "Agregar linea" }));
    await user.click(view.getAllByRole("button", { name: "Quitar" })[1]!);
    const fechaDocumento = (view.getByLabelText("Fecha documento") as HTMLInputElement).value;
    await user.type(view.getByLabelText("Comentarios"), "Orden urgente");
    await user.click(view.getByRole("button", { name: "Crear orden" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledTimes(1);
    });

    expect(onCreate).toHaveBeenCalledWith({
      proveedorId: "prov-1",
      monedaId: 1,
      fechaDocumento: new Date(fechaDocumento).toISOString(),
      fechaVencimiento: undefined,
      comentarios: "Orden urgente",
      detalles: [
        {
          articuloId: "art-1",
          almacenId: "alm-1",
          impuestoId: 1,
          descripcion: "Articulo Uno",
          cantidadTotal: 1,
          precioUnitario: 25,
          descuentoLinea: 0,
        },
      ],
    });
  });

  it("muestra el detalle y permite volver a la lista", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const { view } = renderScreen();

    await user.click(view.getAllByRole("button", { name: "Ver" })[0]!);

    expect(view.getByText("Timeline")).toBeTruthy();
    expect(view.getByText("Responsables")).toBeTruthy();

    await user.click(view.getByRole("button", { name: "Volver" }));

    expect(view.getByText("Ordenes de compra")).toBeTruthy();
  });

  it("filtra las ordenes por texto de busqueda", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const { view } = renderScreen();

    await user.type(view.getByLabelText("Buscar"), "1002");

    expect(view.getByText("OC-1002")).toBeTruthy();
    expect(view.queryByText("OC-1001")).toBeNull();
  });

  it("actualiza una orden en modo edicion", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const { onUpdate, view } = renderScreen({ ordenes: [draftOrder] });

    await user.click(view.getByRole("button", { name: "Editar" }));
    await user.clear(view.getByLabelText("Comentarios"));
    await user.type(view.getByLabelText("Comentarios"), "Borrador ajustado");
    await user.click(view.getByRole("button", { name: "Actualizar orden" }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    expect(onUpdate).toHaveBeenCalledWith("ord-1", {
      proveedorId: "prov-1",
      monedaId: 1,
      fechaDocumento: new Date("2026-04-20").toISOString(),
      fechaVencimiento: new Date("2026-04-25").toISOString(),
      comentarios: "Borrador ajustado",
      detalles: [
        {
          articuloId: "art-1",
          almacenId: "alm-1",
          impuestoId: 1,
          descripcion: "Articulo Uno",
          cantidadTotal: 2,
          precioUnitario: 25,
          descuentoLinea: 0,
        },
      ],
    });
  });

  it("permite cambiar proveedor, moneda y campos de linea al crear", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const { onCreate, view } = renderScreen({ ordenes: [] });

    await user.click(view.getByRole("button", { name: "Nueva orden" }));
    await user.selectOptions(view.getByLabelText("Proveedor"), "prov-2");
    await user.selectOptions(view.getByLabelText("Moneda"), "2");
    await user.selectOptions(view.getByLabelText("Articulo linea 1"), "art-2");
    await user.selectOptions(view.getByLabelText("Almacen linea 1"), "alm-2");
    await user.selectOptions(view.getByLabelText("Impuesto linea 1"), "2");
    fireEvent.change(view.getByLabelText("Fecha documento"), {
      target: { value: "2026-04-22" },
    });
    fireEvent.change(view.getByLabelText("Fecha vencimiento"), {
      target: { value: "2026-04-28" },
    });
    await user.clear(view.getByLabelText("Descripcion linea 1"));
    await user.type(view.getByLabelText("Descripcion linea 1"), "Linea ajustada");
    await user.clear(view.getByLabelText("Cantidad linea 1"));
    await user.type(view.getByLabelText("Cantidad linea 1"), "4");
    await user.clear(view.getByLabelText("Precio linea 1"));
    await user.type(view.getByLabelText("Precio linea 1"), "50");
    await user.clear(view.getByLabelText("Descuento linea 1"));
    await user.type(view.getByLabelText("Descuento linea 1"), "10");
    await user.click(view.getByRole("button", { name: "Crear orden" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledTimes(1);
    });

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        proveedorId: "prov-2",
        monedaId: 2,
      }),
    );
  });

  it("aprueba una orden borrador desde el detalle", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const { onApprove, view } = renderScreen({ ordenes: [draftOrder] });

    await user.click(view.getByRole("button", { name: "Ver" }));
    await user.click(view.getAllByRole("button", { name: "Aprobar" })[1]!);

    await waitFor(() => {
      expect(onApprove).toHaveBeenCalledWith("ord-1");
    });
  });

  it("aprueba una orden borrador", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const { onApprove, view } = renderScreen({ ordenes: [draftOrder] });

    await user.click(view.getByRole("button", { name: "Aprobar" }));

    await waitFor(() => {
      expect(onApprove).toHaveBeenCalledWith("ord-1");
    });

    expect(view.getByText("Timeline")).toBeTruthy();
  });

  it("maneja errores al aprobar y eliminar una orden", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const confirmSpy = spyOn(window, "confirm").mockReturnValue(true);
    const { view } = renderScreen({
      onApprove: mock(async () => {
        throw new Error("No se pudo aprobar la orden");
      }),
      onDelete: mock(async () => {
        throw new Error("No se pudo eliminar la orden");
      }),
      ordenes: [draftOrder],
    });

    await user.click(view.getByRole("button", { name: "Aprobar" }));
    await waitFor(() => {
      expect(view.getByText("No se pudo aprobar la orden")).toBeTruthy();
    });

    await user.click(view.getByRole("button", { name: "Eliminar" }));
    await waitFor(() => {
      expect(view.getByText("No se pudo eliminar la orden")).toBeTruthy();
    });

    confirmSpy.mockRestore();
  });

  it("elimina una orden cuando el usuario confirma y no hace nada si cancela", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const { onDelete, view } = renderScreen({ ordenes: [draftOrder] });
    const confirmSpy = spyOn(window, "confirm");

    confirmSpy.mockReturnValue(false);
    await user.click(view.getByRole("button", { name: "Eliminar" }));
    expect(onDelete).toHaveBeenCalledTimes(0);

    confirmSpy.mockReturnValue(true);
    await user.click(view.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith("ord-1");
    });

    confirmSpy.mockRestore();
  });

  it("registra la recepcion de una orden aprobada", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const { onReceive, view } = renderScreen({ ordenes: [approvedOrder] });

    await user.click(view.getByRole("button", { name: "Recibir" }));
    fireEvent.change(view.getByLabelText("Cantidad a recibir linea 1"), {
      target: { value: "1" },
    });
    await user.type(view.getByLabelText("Comentarios"), "Recepcion parcial");
    await user.click(view.getByRole("button", { name: "Confirmar recepcion" }));

    await waitFor(() => {
      expect(onReceive).toHaveBeenCalledTimes(1);
    });

    expect(onReceive).toHaveBeenCalledWith(
      "ord-2",
      expect.objectContaining({
        comentarios: "Recepcion parcial",
        detalles: [{ lineNum: 1, cantidadRecibida: 1 }],
      }),
    );
  });

  it("abre la recepcion desde el detalle y permite ajustar la fecha antes de cancelar", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const { view } = renderScreen({ ordenes: [approvedOrder] });

    await user.click(view.getByRole("button", { name: "Ver" }));
    await user.click(view.getByRole("button", { name: "Registrar recepcion" }));

    fireEvent.change(view.getByLabelText("Fecha recepcion"), {
      target: { value: "2026-04-22" },
    });

    expect((view.getByLabelText("Fecha recepcion") as HTMLInputElement).value).toBe("2026-04-22");

    await user.click(view.getByRole("button", { name: "Cancelar" }));

    expect(view.queryByRole("button", { name: "Confirmar recepcion" })).toBeNull();
  });

  it("muestra errores de validacion al crear una orden y permite cancelar el flujo", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const createView = renderScreen({
      almacenes: [],
      articulos: [],
      impuestos: [],
      monedas: [],
      ordenes: [],
      proveedores: [],
    }).view;

    await user.click(createView.getByRole("button", { name: "Nueva orden" }));
    await user.click(createView.getByRole("button", { name: "Crear orden" }));

    await waitFor(() => {
      expect(createView.getByText("Selecciona un proveedor valido.")).toBeTruthy();
      expect(createView.getByText("Selecciona una moneda valida.")).toBeTruthy();
      expect(createView.getByText("Corrige las lineas marcadas.")).toBeTruthy();
    });

    fireEvent.input(createView.getByLabelText("Comentarios"), {
      target: { value: "Cambia para limpiar error" },
    });
    await waitFor(() => {
      expect(
        (createView.getByLabelText("Comentarios") as HTMLTextAreaElement).value,
      ).toBe("Cambia para limpiar error");
    });
    await user.click(createView.getByRole("button", { name: "Cancelar" }));
    expect(createView.queryByRole("button", { name: "Crear orden" })).toBeNull();
  });

  it("muestra errores de validacion al recibir una orden y permite cancelar el flujo", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const receiveView = renderScreen({ ordenes: [approvedOrder] }).view;

    await user.click(receiveView.getByRole("button", { name: "Recibir" }));

    await waitFor(() => {
      expect(receiveView.getByRole("button", { name: "Confirmar recepcion" })).toBeTruthy();
    });

    const quantityInput = receiveView.getByLabelText(
      "Cantidad a recibir linea 1",
    ) as HTMLInputElement;
    await user.clear(quantityInput);
    await user.type(quantityInput, "0");
    await user.type(receiveView.getByLabelText("Comentarios"), "x".repeat(251));

    await waitFor(() => {
      expect(quantityInput.value).toBe("0");
    });

    await user.click(receiveView.getByRole("button", { name: "Confirmar recepcion" }));

    await waitFor(() => {
      expect(receiveView.getByText("No excedas 250 caracteres.")).toBeTruthy();
      expect(
        receiveView.getByText("Ingresa al menos una linea con cantidad recibida mayor a 0."),
      ).toBeTruthy();
    });

    fireEvent.change(receiveView.getByLabelText("Fecha recepcion"), {
      target: { value: "2026-04-22" },
    });
    await user.click(receiveView.getByRole("button", { name: "Cancelar" }));
    expect(receiveView.queryByRole("button", { name: "Confirmar recepcion" })).toBeNull();
  }, 10000);

  it("muestra errores del backend cuando fallan las operaciones", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const { view } = renderScreen({
      onCreate: mock(async () => {
        throw new Error("No se pudo guardar en backend");
      }),
      ordenes: [],
    });

    await user.click(view.getByRole("button", { name: "Nueva orden" }));
    await user.click(view.getByRole("button", { name: "Crear orden" }));

    await waitFor(() => {
      expect(view.getByText("No se pudo guardar en backend")).toBeTruthy();
    });
  });
});
