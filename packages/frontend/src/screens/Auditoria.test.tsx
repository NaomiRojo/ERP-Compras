import { describe, expect, it, mock } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { AuditRow } from "../types";
import { AuditoriaScreen } from "./Auditoria";

const auditoria: AuditRow[] = [
  {
    id: "audit-1",
    accion: "UPDATE",
    dataAntes: { estado: "BORRADOR", total: 100 },
    dataDespues: { estado: "APROBADO", total: 100 },
    entidad: "OrdenCompra",
    entidadId: "oc-1",
    fecha: "2026-04-29 10:20",
    ipOrigen: "127.0.0.1",
    usuario: "admin",
  },
  {
    id: "audit-2",
    accion: "CREATE",
    dataAntes: null,
    dataDespues: { cardCode: "PR-001" },
    entidad: "Proveedor",
    entidadId: "prov-1",
    fecha: "2026-04-28 09:00",
    ipOrigen: undefined,
    usuario: "compras",
  },
];

describe("AuditoriaScreen", () => {
  it("muestra resumen, detalle y filtra eventos por busqueda", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const view = render(<AuditoriaScreen auditoria={auditoria} />);

    expect(view.getByText("2 eventos")).toBeTruthy();
    expect(view.getByText("2 usuarios")).toBeTruthy();
    expect(view.getByText("OrdenCompra")).toBeTruthy();
    expect(view.getByText("Campos modificados")).toBeTruthy();
    expect(view.getByText("Antes: BORRADOR")).toBeTruthy();
    expect(view.getByText("Despues: APROBADO")).toBeTruthy();

    await user.type(view.getByLabelText("Buscar"), "proveedor");

    expect(view.queryByText("OrdenCompra")).toBeNull();
    expect(view.getByText("Proveedor")).toBeTruthy();
    expect(view.getByText("1 eventos")).toBeTruthy();
  });

  it("limpia filtros activos y exporta el resultado visible a CSV", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const exportedBlob: { current?: Blob } = {};
    const createObjectURL = mock((blob: Blob) => {
      exportedBlob.current = blob;
      return "blob:auditoria";
    });
    const revokeObjectURL = mock(() => undefined);

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    const originalCreateElement = document.createElement.bind(document);
    const linkClick = mock(() => undefined);
    const createElement = mock((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === "a") {
        element.click = linkClick;
      }
      return element;
    });
    document.createElement = createElement as typeof document.createElement;

    try {
      const view = render(<AuditoriaScreen auditoria={auditoria} />);
      const clearButton = view.getByRole("button", { name: "Limpiar" }) as HTMLButtonElement;
      const exportButton = view.getByRole("button", { name: "Exportar" });

      expect(clearButton.disabled).toBe(true);

      await user.type(view.getByLabelText("Buscar"), "proveedor");

      expect(clearButton.disabled).toBe(false);
      expect(view.getByText("1 eventos")).toBeTruthy();

      await user.click(exportButton);

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(linkClick).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:auditoria");

      expect(exportedBlob.current).toBeTruthy();
      const csvBlob = exportedBlob.current;
      if (!csvBlob) {
        throw new Error("No se genero el archivo CSV");
      }
      const csv = await csvBlob.text();
      expect(csv).toContain('"Proveedor"');
      expect(csv).toContain('"CREATE"');
      expect(csv).not.toContain('"OrdenCompra"');

      await user.click(clearButton);

      await waitFor(() => {
        expect((view.getByLabelText("Buscar") as HTMLInputElement).value).toBe("");
      });
      expect(view.getByText("2 eventos")).toBeTruthy();
    } finally {
      document.createElement = originalCreateElement;
    }
  });
});
