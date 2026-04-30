import { Badge } from "../Common/Badge";
import type { AuditRow } from "../../types";

export function AuditDetail({ audit }: { audit: AuditRow }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h3>Detalle auditoria</h3>
          <p>{audit.entidadId ? `${audit.entidad} / ${audit.entidadId}` : audit.entidad}</p>
        </div>
        <Badge tone="neutral">{audit.accion}</Badge>
      </div>
      <div className="summary-grid summary-grid--three">
        <div>
          <span>Fecha</span>
          <strong>{audit.fecha}</strong>
        </div>
        <div>
          <span>Usuario</span>
          <strong>{audit.usuario}</strong>
        </div>
        <div>
          <span>IP origen</span>
          <strong>{audit.ipOrigen ?? "-"}</strong>
        </div>
      </div>
      <div className="audit-grid">
        <div>
          <span>Antes</span>
          <pre>{JSON.stringify(audit.dataAntes, null, 2)}</pre>
        </div>
        <div>
          <span>Despues</span>
          <pre>{JSON.stringify(audit.dataDespues, null, 2)}</pre>
        </div>
      </div>
    </section>
  );
}
