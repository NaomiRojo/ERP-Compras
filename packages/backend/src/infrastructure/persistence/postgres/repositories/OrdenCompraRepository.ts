import type { Repository } from "typeorm";
import { OrdenCompra } from "src/domain/entities/OrdenCompra";
import { OrdenCompraDetalle } from "src/domain/entities/OrdenCompraDetalle";
import type { IOrdenCompraRepository } from "src/domain/repositories/IOrdenCompraRepository";
import {
  CompraDetalleEntitySchema,
  type CompraDetalleRow,
} from "src/infrastructure/persistence/postgres/entities/CompraDetalleEntity";
import {
  CompraEncabezadoEntitySchema,
  type CompraEncabezadoRow,
} from "src/infrastructure/persistence/postgres/entities/CompraEncabezadoEntity";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

const toDetalleDomain = (row: CompraDetalleRow): OrdenCompraDetalle =>
  new OrdenCompraDetalle({
    id: row.id,
    lineNum: row.lineNum,
    articuloId: row.articuloId,
    almacenId: row.almacenId,
    impuestoId: row.impuestoId,
    descripcion: row.descripcion ?? undefined,
    cantidadTotal: Number(row.cantidadTotal),
    cantidadPendiente: Number(row.cantidadPendiente),
    precioUnitario: Number(row.precioUnitario),
    descuentoLinea: Number(row.descuentoLinea),
    subtotalLinea: Number(row.subtotalLinea),
    totalLinea: Number(row.totalLinea),
  });

const toDomain = (header: CompraEncabezadoRow, detalles: CompraDetalleRow[]): OrdenCompra =>
  new OrdenCompra({
    id: header.id,
    tipoDocId: header.tipoDocId,
    docNum: header.docNum,
    proveedorId: header.proveedorId,
    estadoId: header.estadoId,
    monedaId: header.monedaId,
    fechaDocumento: new Date(header.fechaDocumento),
    fechaVencimiento: header.fechaVencimiento ? new Date(header.fechaVencimiento) : undefined,
    subtotal: Number(header.subtotal),
    descuentoTotal: Number(header.descuentoTotal),
    impuestosTotal: Number(header.impuestosTotal),
    totalDocumento: Number(header.totalDocumento),
    comentarios: header.comentarios ?? undefined,
    createdBy: header.createdBy,
    approvedBy: header.approvedBy ?? undefined,
    detalles: detalles.sort((a, b) => a.lineNum - b.lineNum).map(toDetalleDomain),
  });

export class OrdenCompraRepository implements IOrdenCompraRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async save(ordenCompra: OrdenCompra): Promise<void> {
    await this.headerRepository().save({
      id: ordenCompra.props.id,
      tipoDocId: ordenCompra.props.tipoDocId,
      docNum: ordenCompra.props.docNum,
      proveedorId: ordenCompra.props.proveedorId,
      estadoId: ordenCompra.props.estadoId,
      monedaId: ordenCompra.props.monedaId,
      fechaDocumento: ordenCompra.props.fechaDocumento.toISOString().slice(0, 10),
      fechaVencimiento: ordenCompra.props.fechaVencimiento
        ? ordenCompra.props.fechaVencimiento.toISOString().slice(0, 10)
        : null,
      subtotal: ordenCompra.props.subtotal.toFixed(2),
      descuentoTotal: ordenCompra.props.descuentoTotal.toFixed(2),
      impuestosTotal: ordenCompra.props.impuestosTotal.toFixed(2),
      totalDocumento: ordenCompra.props.totalDocumento.toFixed(2),
      comentarios: ordenCompra.props.comentarios ?? null,
      createdBy: ordenCompra.props.createdBy,
      approvedBy: ordenCompra.props.approvedBy ?? null,
    });

    await this.detailRepository().delete({ docId: ordenCompra.props.id });

    await this.detailRepository().save(
      ordenCompra.props.detalles.map((detalle) => ({
        id: detalle.props.id,
        docId: ordenCompra.props.id,
        lineNum: detalle.props.lineNum,
        articuloId: detalle.props.articuloId,
        almacenId: detalle.props.almacenId,
        impuestoId: detalle.props.impuestoId,
        descripcion: detalle.props.descripcion ?? null,
        cantidadTotal: detalle.props.cantidadTotal.toFixed(4),
        cantidadPendiente: detalle.props.cantidadPendiente.toFixed(4),
        precioUnitario: detalle.props.precioUnitario.toFixed(4),
        descuentoLinea: detalle.props.descuentoLinea.toFixed(2),
        subtotalLinea: detalle.props.subtotalLinea.toFixed(2),
        totalLinea: detalle.props.totalLinea.toFixed(2),
      })),
    );
  }

  public async findById(id: string): Promise<OrdenCompra | null> {
    const header = await this.headerRepository().findOneBy({ id });
    if (!header) {
      return null;
    }

    const detalles = await this.detailRepository().findBy({ docId: id });
    return toDomain(header, detalles);
  }

  public async findAll(): Promise<OrdenCompra[]> {
    const headers = await this.headerRepository().find({
      order: {
        docNum: "DESC",
      },
    });

    const details = await this.detailRepository().find();
    const detailsByDocId = new Map<string, CompraDetalleRow[]>();

    for (const detail of details) {
      const current = detailsByDocId.get(detail.docId) ?? [];
      current.push(detail);
      detailsByDocId.set(detail.docId, current);
    }

    return headers.map((header) => toDomain(header, detailsByDocId.get(header.id) ?? []));
  }

  public async deleteById(id: string): Promise<boolean> {
    await this.detailRepository().delete({ docId: id });
    const result = await this.headerRepository().delete({ id });
    return (result.affected ?? 0) > 0;
  }

  public async nextDocNum(tipoDocId: number): Promise<number> {
    await this.unitOfWork.getEntityManager().query("SELECT pg_advisory_xact_lock($1)", [tipoDocId]);

    const raw = await this.unitOfWork.getEntityManager().query(
      "SELECT COALESCE(MAX(doc_num), 0) + 1 AS next_doc_num FROM compras_encabezado WHERE tipo_doc_id = $1",
      [tipoDocId],
    );

    return Number(raw[0]?.next_doc_num ?? 1);
  }

  private headerRepository(): Repository<CompraEncabezadoRow> {
    return this.unitOfWork.getRepository(CompraEncabezadoEntitySchema);
  }

  private detailRepository(): Repository<CompraDetalleRow> {
    return this.unitOfWork.getRepository(CompraDetalleEntitySchema);
  }
}
