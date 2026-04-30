import { useMemo, useState } from "react";

import { AuditDetail } from "../components/Audit/AuditDetail";
import { DataTable } from "../components/Common/DataTable";
import { SearchBar } from "../components/Common/SearchBar";
import type { AuditRow } from "../types";

export function AuditoriaScreen({ auditoria }: { auditoria: AuditRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(auditoria[0]?.id ?? null);

  const filteredAudit = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) {
      return auditoria;
    }

    return auditoria.filter((audit) =>
      [audit.fecha, audit.usuario, audit.entidad, audit.entidadId, audit.accion]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [auditoria, searchTerm]);

  const selectedAudit =
    filteredAudit.find((audit) => audit.id === selectedAuditId) ??
    auditoria.find((audit) => audit.id === selectedAuditId) ??
    filteredAudit[0] ??
    null;

  return (
    <div className="stack">
      <DataTable
        title="Auditoria"
        description="Eventos relevantes con detalle navegable del cambio registrado."
        headers={["Fecha", "Usuario", "Entidad", "Accion", "Detalle"]}
        actions={
          <SearchBar
            onChange={setSearchTerm}
            placeholder="Usuario, entidad, accion, id..."
            value={searchTerm}
          />
        }
        emptyMessage="No hay eventos de auditoria que coincidan con la busqueda."
        rows={filteredAudit.map((audit) => [
          audit.fecha,
          audit.usuario,
          audit.entidad,
          audit.accion,
          <button
            key={`${audit.id}-detail`}
            className="link-button"
            onClick={() => setSelectedAuditId(audit.id)}
            type="button"
          >
            Ver cambio
          </button>,
        ])}
      />
      {selectedAudit ? <AuditDetail audit={selectedAudit} /> : null}
    </div>
  );
}
