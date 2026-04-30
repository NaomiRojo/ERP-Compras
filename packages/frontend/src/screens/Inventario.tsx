import { useMemo, useState } from "react";

import { Badge } from "../components/Common/Badge";
import { DataTable } from "../components/Common/DataTable";
import { SearchBar } from "../components/Common/SearchBar";
import type { InventoryRow, Movement } from "../types";

type InventarioScreenProps = {
  inventario: InventoryRow[];
  movimientos: Movement[];
};

export function InventarioScreen({ inventario, movimientos }: InventarioScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(movimientos[0]?.id ?? null);

  const filteredInventory = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) {
      return inventario;
    }

    return inventario.filter((item) =>
      [item.sku, item.nombre, item.almacen].join(" ").toLowerCase().includes(normalizedQuery),
    );
  }, [inventario, searchTerm]);

  const filteredMovements = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) {
      return movimientos;
    }

    return movimientos.filter((movement) =>
      [
        movement.fecha,
        movement.sku,
        movement.almacen,
        movement.tipo,
        movement.ref,
        movement.comentario,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [movimientos, searchTerm]);

  const selectedMovement =
    filteredMovements.find((movement) => movement.id === selectedMovementId) ??
    movimientos.find((movement) => movement.id === selectedMovementId) ??
    filteredMovements[0] ??
    null;

  return (
    <div className="stack">
      <DataTable
        title="Stocks actuales"
        description="Disponibilidad por almacen con busqueda operativa."
        headers={["Articulo", "Almacen", "Fisico", "Comprometido", "Solicitado", "Disponible"]}
        actions={
          <SearchBar
            onChange={setSearchTerm}
            placeholder="SKU, articulo, almacen, referencia..."
            value={searchTerm}
          />
        }
        emptyMessage="No hay stock que coincida con la busqueda."
        rows={filteredInventory.map((item) => [
          <div key={`${item.sku}-label`}>
            <strong>{item.sku}</strong>
            <p className="muted-text">{item.nombre}</p>
          </div>,
          item.almacen,
          item.fisico,
          item.comprometido,
          item.solicitado,
          <strong key={`${item.sku}-disp`}>{item.disponible}</strong>,
        ])}
      />

      <DataTable
        title="Movimientos"
        description="Ultimos eventos de stock con acceso al detalle del movimiento."
        headers={["Fecha", "SKU", "Tipo", "Cant.", "Referencia", "Comentario", "Detalle"]}
        emptyMessage="No hay movimientos que coincidan con la busqueda."
        rows={filteredMovements.map((movement) => [
          movement.fecha,
          movement.sku,
          <Badge key={`${movement.ref}-type`} tone={movement.tipo === "ENT" ? "success" : "warning"}>
            {movement.tipo}
          </Badge>,
          movement.cant,
          movement.ref,
          movement.comentario,
          <button
            key={`${movement.id}-detail`}
            className="link-button"
            onClick={() => setSelectedMovementId(movement.id)}
            type="button"
          >
            Ver
          </button>,
        ])}
      />

      {selectedMovement ? (
        <section className="panel">
          <div className="panel__header">
            <div>
              <h3>Detalle del movimiento</h3>
              <p>{selectedMovement.docReferenciaId}</p>
            </div>
            <Badge tone={selectedMovement.tipo === "ENT" ? "success" : "warning"}>
              {selectedMovement.tipo}
            </Badge>
          </div>

          <div className="summary-grid summary-grid--four">
            <div>
              <span>Fecha</span>
              <strong>{selectedMovement.fecha}</strong>
            </div>
            <div>
              <span>Articulo</span>
              <strong>{selectedMovement.sku}</strong>
            </div>
            <div>
              <span>Almacen</span>
              <strong>{selectedMovement.almacen}</strong>
            </div>
            <div>
              <span>Usuario</span>
              <strong>{selectedMovement.usuario}</strong>
            </div>
          </div>

          <div className="summary-grid summary-grid--three">
            <div>
              <span>Cantidad</span>
              <strong>{selectedMovement.cant}</strong>
            </div>
            <div>
              <span>Costo momento</span>
              <strong>Bs {selectedMovement.costoMomento.toLocaleString()}</strong>
            </div>
            <div>
              <span>Referencia</span>
              <strong>{selectedMovement.ref}</strong>
            </div>
          </div>

          <div className="detail-copy">
            <strong>Comentario</strong>
            <p>{selectedMovement.comentario}</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
