import { describe, expect, it, mock, spyOn } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Article } from "../types";
import type { GrupoArticuloApi, ImpuestoApi } from "../types/api";
import { ArticulosScreen } from "./Articulos";

const grupos: GrupoArticuloApi[] = [
  {
    id: 1,
    codigo: "MAT",
    nombre: "Materiales",
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

describe("ArticulosScreen", () => {
  it("crea un articulo con el payload esperado", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onCreate = mock(async () => undefined);

    const view = render(
      <ArticulosScreen
        articulos={[]}
        canManage
        grupos={grupos}
        impuestos={impuestos}
        onCreate={onCreate}
        onDelete={mock(async () => undefined)}
        onUpdate={mock(async () => undefined)}
      />,
    );

    await user.click(view.getByRole("button", { name: "Nuevo articulo" }));
    await user.type(view.getByLabelText("SKU"), "SKU-200");
    await user.type(view.getByLabelText("Nombre"), "Articulo Dos");
    await user.clear(view.getByLabelText("Unidad"));
    await user.type(view.getByLabelText("Unidad"), "CJ");
    await user.type(view.getByLabelText("Descripcion"), "Caja de tornillos");
    await user.clear(view.getByLabelText("Costo estandar"));
    await user.type(view.getByLabelText("Costo estandar"), "18.5");
    await user.click(view.getByRole("button", { name: "Crear articulo" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledTimes(1);
    });

    expect(onCreate).toHaveBeenCalledWith({
      itemCode: "SKU-200",
      itemName: "Articulo Dos",
      descripcion: "Caja de tornillos",
      unidadMedida: "CJ",
      costoEstandar: 18.5,
      grupoId: 1,
      impuestoId: 1,
    });
  });

  it("bloquea el submit cuando el formulario tiene errores de validacion", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onCreate = mock(async () => undefined);

    const view = render(
      <ArticulosScreen
        articulos={articulos}
        canManage
        grupos={grupos}
        impuestos={impuestos}
        onCreate={onCreate}
        onDelete={mock(async () => undefined)}
        onUpdate={mock(async () => undefined)}
      />,
    );

    await user.click(view.getByRole("button", { name: "Nuevo articulo" }));
    await user.type(view.getByLabelText("SKU"), "S");
    await user.type(view.getByLabelText("Nombre"), "AB");
    await user.clear(view.getByLabelText("Unidad"));
    await user.type(view.getByLabelText("Unidad"), "1");
    await user.clear(view.getByLabelText("Costo estandar"));
    await user.type(view.getByLabelText("Costo estandar"), "-5");
    await user.click(view.getByRole("button", { name: "Crear articulo" }));

    expect(onCreate).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      expect(
        view.getByText("Usa 2-30 caracteres: letras, numeros, punto, guion, / o _."),
      ).toBeTruthy();
      expect(view.getByText("Ingresa al menos 3 caracteres.")).toBeTruthy();
      expect(view.getByText("Usa 2-10 letras, por ejemplo UNI o CJ.")).toBeTruthy();
      expect(view.getByText("Ingresa un costo valido mayor o igual a 0.")).toBeTruthy();
    });
  });

  it("valida errores visibles, catalogos invalidos y limpia el error global cuando el usuario corrige", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onCreate = mock(async () => undefined);

    const view = render(
      <ArticulosScreen
        articulos={[]}
        canManage
        grupos={[]}
        impuestos={[]}
        onCreate={onCreate}
        onDelete={mock(async () => undefined)}
        onUpdate={mock(async () => undefined)}
      />,
    );

    await user.click(view.getByRole("button", { name: "Nuevo articulo" }));
    await user.type(view.getByLabelText("SKU"), "SKU-901");
    await user.type(view.getByLabelText("Nombre"), "AB");
    await user.click(view.getByRole("button", { name: "Crear articulo" }));

    await waitFor(() => {
      expect(view.getByText("Ingresa al menos 3 caracteres.")).toBeTruthy();
      expect(view.getByText("Selecciona un grupo valido.")).toBeTruthy();
      expect(view.getByText("Selecciona un impuesto valido.")).toBeTruthy();
      expect(view.getByText("Corrige los campos marcados para continuar.")).toBeTruthy();
    });

    const nombreInput = view.getByRole("textbox", { name: /^Nombre\b/ });
    await user.clear(nombreInput);
    await user.type(nombreInput, "Articulo corregido");

    await waitFor(() => {
      expect(view.queryByText("Corrige los campos marcados para continuar.")).toBeNull();
    });

    expect(onCreate).toHaveBeenCalledTimes(0);
  });

  it("actualiza un articulo existente desde el editor", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onUpdate = mock(async () => undefined);

    const view = render(
      <ArticulosScreen
        articulos={articulos}
        canManage
        grupos={grupos}
        impuestos={impuestos}
        onCreate={mock(async () => undefined)}
        onDelete={mock(async () => undefined)}
        onUpdate={onUpdate}
      />,
    );

    await user.click(view.getByRole("button", { name: "Editar" }));
    await user.clear(view.getByLabelText("Nombre"));
    await user.type(view.getByLabelText("Nombre"), "Articulo Uno Ajustado");
    await user.click(view.getByRole("button", { name: "Actualizar articulo" }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    expect(onUpdate).toHaveBeenCalledWith("art-1", {
      itemCode: "SKU-001",
      itemName: "Articulo Uno Ajustado",
      descripcion: "Descripcion base",
      unidadMedida: "UNI",
      costoEstandar: 25,
      grupoId: 1,
      impuestoId: 1,
    });
  });

  it("elimina un articulo cuando el usuario confirma y muestra error si backend falla", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onDelete = mock(async () => {
      throw new Error("No se pudo eliminar el articulo");
    });
    const confirmSpy = spyOn(window, "confirm").mockReturnValue(true);

    const view = render(
      <ArticulosScreen
        articulos={articulos}
        canManage
        grupos={grupos}
        impuestos={impuestos}
        onCreate={mock(async () => undefined)}
        onDelete={onDelete}
        onUpdate={mock(async () => undefined)}
      />,
    );

    await user.click(view.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith("art-1");
      expect(view.getByText("No se pudo eliminar el articulo")).toBeTruthy();
    });

    confirmSpy.mockRestore();
  });

  it("muestra error al guardar y no elimina cuando el usuario cancela la confirmacion", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onCreate = mock(async () => {
      throw new Error("No se pudo guardar el articulo");
    });
    const onDelete = mock(async () => undefined);
    const confirmSpy = spyOn(window, "confirm").mockReturnValue(false);

    const view = render(
      <ArticulosScreen
        articulos={articulos}
        canManage
        grupos={grupos}
        impuestos={impuestos}
        onCreate={onCreate}
        onDelete={onDelete}
        onUpdate={mock(async () => undefined)}
      />,
    );

    await user.click(view.getByRole("button", { name: "Nuevo articulo" }));
    await user.type(view.getByLabelText("SKU"), "SKU-500");
    await user.type(view.getByLabelText("Nombre"), "Articulo con error");
    await user.click(view.getByRole("button", { name: "Crear articulo" }));

    await waitFor(() => {
      expect(view.getByText("No se pudo guardar el articulo")).toBeTruthy();
    });

    await user.click(view.getAllByRole("button", { name: "Cancelar" })[0]!);
    await user.click(view.getByRole("button", { name: "Eliminar" }));

    expect(onDelete).toHaveBeenCalledTimes(0);

    confirmSpy.mockRestore();
  });

  it("muestra modo solo lectura y permite filtrar la tabla", async () => {
    const user = userEvent.setup({ document: globalThis.document });

    const view = render(
      <ArticulosScreen
        articulos={articulos}
        canManage={false}
        grupos={grupos}
        impuestos={impuestos}
        onCreate={mock(async () => undefined)}
        onDelete={mock(async () => undefined)}
        onUpdate={mock(async () => undefined)}
      />,
    );

    expect((view.getByRole("button", { name: "Nuevo articulo" }) as HTMLButtonElement).disabled).toBe(true);
    expect((view.getByRole("button", { name: "Editar" }) as HTMLButtonElement).disabled).toBe(true);
    expect((view.getByRole("button", { name: "Eliminar" }) as HTMLButtonElement).disabled).toBe(true);

    await user.type(view.getByLabelText("Buscar"), "no-existe");

    expect(view.getByText("No hay articulos que coincidan con la busqueda.")).toBeTruthy();
  });
});
