import { describe, expect, it, mock } from "bun:test";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Order } from "../../types";
import { OrderDetail } from "./OrderDetail";

const baseOrder: Order = {
  id: "ord-1",
  docNum: "1001",
  proveedorId: "prov-1",
  proveedor: "Proveedor Uno",
  estadoId: 1,
  estado: "APROBADO",
  fechaDocumento: "2026-04-20T00:00:00.000Z",
  fecha: "20/04/2026",
  fechaVencimiento: "2026-04-30T00:00:00.000Z",
  total: 226,
  subtotal: 200,
  descuentoTotal: 10,
  impuestosTotal: 36,
  moneda: "Bs",
  monedaId: 1,
  comentarios: "Compra aprobada",
  createdBy: "admin",
  approvedBy: "supervisor",
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
      pendingQty: 1,
      price: 100,
      discount: 10,
      lineSubtotal: 200,
      lineTotal: 226,
    },
  ],
  timeline: [
    {
      date: "20/04/2026 08:00",
      action: "Creada",
      user: "admin",
      note: "Documento generado",
    },
  ],
};

describe("OrderDetail", () => {
  it("renderiza resumen, lineas, timeline y acciones", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onBack = mock(() => {});

    const view = render(
      <OrderDetail
        actions={<button type="button">Accion custom</button>}
        onBack={onBack}
        order={baseOrder}
      />,
    );

    expect(view.getByText("OC-1001")).toBeTruthy();
    expect(view.getByText("Proveedor Uno")).toBeTruthy();
    expect(view.getByText("Compra aprobada")).toBeTruthy();
    expect(view.getByText("SKU-001")).toBeTruthy();
    expect(view.getByText("Creada")).toBeTruthy();
    expect(view.getByText("Creada por admin")).toBeTruthy();
    expect(view.getByText("Aprobada por supervisor")).toBeTruthy();
    expect(view.getByRole("button", { name: "Accion custom" })).toBeTruthy();
    expect(
      view.getByText(new Date(baseOrder.fechaVencimiento!).toLocaleDateString("es-BO")),
    ).toBeTruthy();

    await user.click(view.getByRole("button", { name: "Volver" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("muestra fallbacks cuando faltan comentarios, vencimiento y aprobacion", () => {
    const view = render(
      <OrderDetail
        onBack={() => {}}
        order={{
          ...baseOrder,
          approvedBy: undefined,
          comentarios: "",
          fechaVencimiento: undefined,
        }}
      />,
    );

    expect(view.getByText("Sin comentarios.")).toBeTruthy();
    expect(view.getByText("Sin aprobacion registrada")).toBeTruthy();
    expect(view.getByText("-")).toBeTruthy();
  });
});
