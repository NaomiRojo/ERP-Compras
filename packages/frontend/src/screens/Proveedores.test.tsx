import { describe, expect, it, mock, spyOn } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Provider } from "../types";
import type { MonedaApi } from "../types/api";
import { ProveedoresScreen } from "./Proveedores";

const monedas: MonedaApi[] = [
  {
    id: 1,
    codigo: "Bs",
    nombre: "Boliviano",
    tasaActual: 1,
  },
];

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

describe("ProveedoresScreen", () => {
  it("crea un proveedor con el payload esperado", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onCreate = mock(async () => undefined);

    const view = render(
      <ProveedoresScreen
        canManage
        monedas={monedas}
        onCreate={onCreate}
        onDelete={mock(async () => undefined)}
        onUpdate={mock(async () => undefined)}
        proveedores={[]}
      />,
    );

    await user.click(view.getByRole("button", { name: "Nuevo proveedor" }));
    await user.type(view.getByLabelText("Codigo"), "PR-200");
    await user.type(view.getByLabelText("Nombre legal"), "Proveedor Dos");
    await user.type(view.getByLabelText("NIT/RUT"), "7654321");
    await user.type(view.getByLabelText("Linea de credito"), "2500");
    await user.type(view.getByLabelText("Email"), "ventas@proveedor2.test");
    await user.type(view.getByLabelText("Telefono"), "70112233");
    await user.type(view.getByLabelText("Direccion"), "Calle Secundaria 45");
    await user.click(view.getByRole("button", { name: "Crear proveedor" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledTimes(1);
    });

    expect(onCreate).toHaveBeenCalledWith({
      cardCode: "PR-200",
      cardName: "Proveedor Dos",
      nitRut: "7654321",
      monedaId: 1,
      nombreComercial: undefined,
      email: "ventas@proveedor2.test",
      telefono: "70112233",
      direccion: "Calle Secundaria 45",
      lineaCredito: 2500,
    });
  }, 10000);

  it("bloquea el submit cuando el formulario tiene errores de formato", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onCreate = mock(async () => undefined);

    const view = render(
      <ProveedoresScreen
        canManage
        monedas={monedas}
        onCreate={onCreate}
        onDelete={mock(async () => undefined)}
        onUpdate={mock(async () => undefined)}
        proveedores={[]}
      />,
    );

    await user.click(view.getByRole("button", { name: "Nuevo proveedor" }));
    await user.type(view.getByLabelText("Codigo"), "P");
    await user.type(view.getByLabelText("Nombre legal"), "AB");
    await user.type(view.getByLabelText("NIT/RUT"), "12");
    await user.type(view.getByLabelText("Email"), "correo-invalido");
    await user.click(view.getByRole("button", { name: "Crear proveedor" }));

    expect(onCreate).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      expect(
        view.getByText("Usa 2-20 caracteres: letras, numeros, punto, guion, / o _."),
      ).toBeTruthy();
      expect(view.getByText("Ingresa al menos 3 caracteres.")).toBeTruthy();
      expect(view.getByText("Usa 5-20 caracteres alfanumericos o guiones.")).toBeTruthy();
      expect(view.getByText("Ingresa un correo valido.")).toBeTruthy();
    });
  });

  it("valida errores visibles, moneda invalida y limpia el error global al corregir", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onCreate = mock(async () => undefined);

    const view = render(
      <ProveedoresScreen
        canManage
        monedas={[]}
        onCreate={onCreate}
        onDelete={mock(async () => undefined)}
        onUpdate={mock(async () => undefined)}
        proveedores={[]}
      />,
    );

    await user.click(view.getByRole("button", { name: "Nuevo proveedor" }));
    await user.type(view.getByLabelText("Codigo"), "PR-999");
    await user.type(view.getByLabelText("Nombre legal"), "AB");
    await user.type(view.getByLabelText("NIT/RUT"), "1234567");
    await user.type(view.getByLabelText("Telefono"), "abc");
    await user.click(view.getByRole("button", { name: "Crear proveedor" }));

    await waitFor(() => {
      expect(view.getByText("Ingresa al menos 3 caracteres.")).toBeTruthy();
      expect(view.getByText("Ingresa un telefono valido con 7 a 15 digitos.")).toBeTruthy();
      expect(view.getByText("Selecciona una moneda valida.")).toBeTruthy();
      expect(view.getByText("Corrige los campos marcados para continuar.")).toBeTruthy();
    });

    const nombreLegalInput = view.getByRole("textbox", { name: /^Nombre legal\b/ });
    await user.clear(nombreLegalInput);
    await user.type(nombreLegalInput, "Proveedor corregido");

    await waitFor(() => {
      expect(view.queryByText("Corrige los campos marcados para continuar.")).toBeNull();
    });

    expect(onCreate).toHaveBeenCalledTimes(0);
  });

  it("actualiza un proveedor existente desde el editor", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onUpdate = mock(async () => undefined);

    const view = render(
      <ProveedoresScreen
        canManage
        monedas={monedas}
        onCreate={mock(async () => undefined)}
        onDelete={mock(async () => undefined)}
        onUpdate={onUpdate}
        proveedores={proveedores}
      />,
    );

    await user.click(view.getByRole("button", { name: "Editar" }));

    const nombreInput = view.getByLabelText("Nombre legal") as HTMLInputElement;
    expect(nombreInput.value).toBe("Proveedor Uno");

    await user.clear(nombreInput);
    await user.type(nombreInput, "Proveedor Uno Actualizado");
    await user.click(view.getByRole("button", { name: "Actualizar proveedor" }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    expect(onUpdate).toHaveBeenCalledWith("prov-1", {
      cardCode: "PR-001",
      cardName: "Proveedor Uno Actualizado",
      nitRut: "1234567",
      monedaId: 1,
      nombreComercial: "Proveedor Uno SRL",
      email: "contacto@proveedor.test",
      telefono: "77777777",
      direccion: "Av. Principal 123",
      lineaCredito: 5000,
    });
  });

  it("elimina un proveedor cuando el usuario confirma", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onDelete = mock(async () => undefined);
    const confirmSpy = spyOn(window, "confirm").mockReturnValue(true);

    const view = render(
      <ProveedoresScreen
        canManage
        monedas={monedas}
        onCreate={mock(async () => undefined)}
        onDelete={onDelete}
        onUpdate={mock(async () => undefined)}
        proveedores={proveedores}
      />,
    );

    await user.click(view.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith("prov-1");
    });

    confirmSpy.mockRestore();
  });

  it("no elimina un proveedor cuando el usuario cancela", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onDelete = mock(async () => undefined);
    const confirmSpy = spyOn(window, "confirm").mockReturnValue(false);

    const view = render(
      <ProveedoresScreen
        canManage
        monedas={monedas}
        onCreate={mock(async () => undefined)}
        onDelete={onDelete}
        onUpdate={mock(async () => undefined)}
        proveedores={proveedores}
      />,
    );

    await user.click(view.getByRole("button", { name: "Eliminar" }));

    expect(onDelete).toHaveBeenCalledTimes(0);

    confirmSpy.mockRestore();
  });

  it("muestra modo solo lectura y filtra resultados", async () => {
    const user = userEvent.setup({ document: globalThis.document });

    const view = render(
      <ProveedoresScreen
        canManage={false}
        monedas={monedas}
        onCreate={mock(async () => undefined)}
        onDelete={mock(async () => undefined)}
        onUpdate={mock(async () => undefined)}
        proveedores={proveedores}
      />,
    );

    expect((view.getByRole("button", { name: "Nuevo proveedor" }) as HTMLButtonElement).disabled).toBe(true);
    expect((view.getByRole("button", { name: "Editar" }) as HTMLButtonElement).disabled).toBe(true);
    expect((view.getByRole("button", { name: "Eliminar" }) as HTMLButtonElement).disabled).toBe(true);

    await user.type(view.getByLabelText("Buscar"), "desconocido");

    expect(view.getByText("No hay proveedores que coincidan con la busqueda.")).toBeTruthy();
  });

  it("muestra errores del backend cuando no puede guardar o eliminar", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onCreate = mock(async () => {
      throw new Error("No se pudo guardar el proveedor");
    });
    const onDelete = mock(async () => {
      throw new Error("No se pudo eliminar el proveedor");
    });
    const confirmSpy = spyOn(window, "confirm").mockReturnValue(true);

    const view = render(
      <ProveedoresScreen
        canManage
        monedas={monedas}
        onCreate={onCreate}
        onDelete={onDelete}
        onUpdate={mock(async () => undefined)}
        proveedores={proveedores}
      />,
    );

    await user.click(view.getByRole("button", { name: "Nuevo proveedor" }));
    await user.type(view.getByLabelText("Codigo"), "PR-300");
    await user.type(view.getByLabelText("Nombre legal"), "Proveedor Tres");
    await user.type(view.getByLabelText("NIT/RUT"), "12345678");
    await user.click(view.getByRole("button", { name: "Crear proveedor" }));

    await waitFor(() => {
      expect(view.getByText("No se pudo guardar el proveedor")).toBeTruthy();
    });

    await user.click(view.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith("prov-1");
      expect(view.getByText("No se pudo eliminar el proveedor")).toBeTruthy();
    });

    confirmSpy.mockRestore();
  });

  it("muestra el error de eliminacion tambien cuando el editor esta cerrado", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onDelete = mock(async () => {
      throw new Error("No se pudo eliminar el proveedor");
    });
    const confirmSpy = spyOn(window, "confirm").mockReturnValue(true);

    const view = render(
      <ProveedoresScreen
        canManage
        monedas={monedas}
        onCreate={mock(async () => undefined)}
        onDelete={onDelete}
        onUpdate={mock(async () => undefined)}
        proveedores={proveedores}
      />,
    );

    await user.click(view.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(view.getByText("No se pudo eliminar el proveedor")).toBeTruthy();
    });

    confirmSpy.mockRestore();
  });
});
