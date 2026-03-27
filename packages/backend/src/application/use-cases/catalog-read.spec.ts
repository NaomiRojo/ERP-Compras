import { describe, expect, test } from "bun:test";
import { Articulo } from "src/domain/entities/Articulo";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import { OrdenCompraDetalle } from "src/domain/entities/OrdenCompraDetalle";
import { Proveedor } from "src/domain/entities/Proveedor";
import type { IArticuloRepository } from "src/domain/repositories/IArticuloRepository";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";
import type { IProveedorRepository } from "src/domain/repositories/IProveedorRepository";
import { ListarArticulosUseCase } from "./articulo/ListarArticulosUseCase";
import { ObtenerArticuloUseCase } from "./articulo/ObtenerArticuloUseCase";
import { ListarOrdenesCompraUseCase } from "./orden-compra/ListarOrdenesCompraUseCase";
import { ObtenerOrdenCompraUseCase } from "./orden-compra/ObtenerOrdenCompraUseCase";
import { ListarProveedoresUseCase } from "./proveedor/ListarProveedoresUseCase";
import { ObtenerProveedorUseCase } from "./proveedor/ObtenerProveedorUseCase";

const proveedor = new Proveedor({
  id: "prov-1",
  cardCode: "PRV-001",
  cardName: "Proveedor Demo",
  nitRut: "1234567",
  monedaId: 1,
  balanceCuenta: 0,
  lineaCredito: 1000,
  activo: true,
});

const articulo = new Articulo({
  id: "art-1",
  itemCode: "ITEM-001",
  itemName: "Articulo Demo",
  unidadMedida: "UNI",
  costoEstandar: 100,
  grupoId: 1,
  impuestoId: 1,
  activo: true,
});

const orden = new OrdenCompra({
  id: "oc-1",
  tipoDocId: 2,
  docNum: 1001,
  proveedorId: proveedor.props.id,
  estadoId: 1,
  monedaId: 1,
  fechaDocumento: new Date("2026-03-26T00:00:00.000Z"),
  subtotal: 100,
  descuentoTotal: 0,
  impuestosTotal: 13,
  totalDocumento: 113,
  createdBy: "user-1",
  detalles: [
    new OrdenCompraDetalle({
      id: "line-1",
      lineNum: 0,
      articuloId: articulo.props.id,
      almacenId: "ALM-01",
      impuestoId: 1,
      cantidadTotal: 1,
      cantidadPendiente: 1,
      precioUnitario: 100,
      descuentoLinea: 0,
      subtotalLinea: 100,
      totalLinea: 113,
    }),
  ],
});

const articuloRepository: IArticuloRepository = {
  async save() {},
  async findById(id) {
    return id === articulo.props.id ? articulo : null;
  },
  async findByItemCode(itemCode) {
    return itemCode === articulo.props.itemCode ? articulo : null;
  },
  async findAll() {
    return [articulo];
  },
  async deleteById() {
    return false;
  },
};

const proveedorRepository: IProveedorRepository = {
  async save() {},
  async findById(id) {
    return id === proveedor.props.id ? proveedor : null;
  },
  async findByCardCode(cardCode) {
    return cardCode === proveedor.props.cardCode ? proveedor : null;
  },
  async findByNitRut(nitRut) {
    return nitRut === proveedor.props.nitRut ? proveedor : null;
  },
  async findAll() {
    return [proveedor];
  },
  async deleteById() {
    return false;
  },
};

const ordenRepository: IOrdenCompraRepository = {
  async save() {},
  async findById(id) {
    return id === orden.props.id ? orden : null;
  },
  async findAll() {
    return [orden];
  },
  async deleteById() {
    return false;
  },
  async nextDocNum() {
    return 1002;
  },
};

describe("Read-only catalog use cases", () => {
  test("lista articulos, proveedores y ordenes", async () => {
    await expect(new ListarArticulosUseCase(articuloRepository).execute()).resolves.toEqual([articulo]);
    await expect(new ListarProveedoresUseCase(proveedorRepository).execute()).resolves.toEqual([proveedor]);
    await expect(new ListarOrdenesCompraUseCase(ordenRepository).execute()).resolves.toEqual([orden]);
  });

  test("obtiene articulo, proveedor y orden existentes", async () => {
    await expect(new ObtenerArticuloUseCase(articuloRepository).execute("art-1")).resolves.toBe(articulo);
    await expect(new ObtenerProveedorUseCase(proveedorRepository).execute("prov-1")).resolves.toBe(proveedor);
    await expect(new ObtenerOrdenCompraUseCase(ordenRepository).execute("oc-1")).resolves.toBe(orden);
  });

  test("lanza error cuando el recurso no existe", async () => {
    await expect(new ObtenerArticuloUseCase(articuloRepository).execute("missing")).rejects.toThrow(
      "Articulo no encontrado",
    );
    await expect(new ObtenerProveedorUseCase(proveedorRepository).execute("missing")).rejects.toThrow(
      "Proveedor no encontrado",
    );
    await expect(new ObtenerOrdenCompraUseCase(ordenRepository).execute("missing")).rejects.toThrow(
      "Orden de compra no encontrada",
    );
  });
});
