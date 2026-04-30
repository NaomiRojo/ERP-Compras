import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import StorageIcon from "@mui/icons-material/Storage";

import { Badge } from "../Common/Badge";
import type { AuditRow } from "../../types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const stringifyValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
};

const buildChangedFields = (before: unknown, after: unknown) => {
  if (!isRecord(before) || !isRecord(after)) {
    return [];
  }

  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((key) => stringifyValue(before[key]) !== stringifyValue(after[key]))
    .map((key) => ({
      after: stringifyValue(after[key]),
      before: stringifyValue(before[key]),
      key,
    }));
};

export function AuditDetail({ audit }: { audit: AuditRow }) {
  const changedFields = buildChangedFields(audit.dataAntes, audit.dataDespues);

  return (
    <Paper className="panel" component="section" variant="outlined">
      <Stack className="panel__header" direction={{ sm: "row", xs: "column" }} spacing={2}>
        <Box>
          <Typography component="h3" variant="h6">
            Detalle auditoria
          </Typography>
          <Typography color="text.secondary">
            {audit.entidadId ? `${audit.entidad} / ${audit.entidadId}` : audit.entidad}
          </Typography>
        </Box>
        <Badge tone="neutral">{audit.accion}</Badge>
      </Stack>

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

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { lg: "minmax(0, 0.85fr) minmax(0, 1.15fr)", xs: "1fr" }, mb: 2 }}>
        <Paper sx={{ p: 2 }} variant="outlined">
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <CompareArrowsIcon color="primary" fontSize="small" />
              <Typography component="h4" variant="subtitle1">
                Campos modificados
              </Typography>
            </Stack>
            {changedFields.length > 0 ? (
              <Stack spacing={1}>
                {changedFields.slice(0, 6).map((field) => (
                  <Box key={field.key} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.25 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                      <Chip label={field.key} size="small" />
                    </Stack>
                    <Typography color="text.secondary" variant="body2">
                      Antes: {field.before}
                    </Typography>
                    <Typography variant="body2">Despues: {field.after}</Typography>
                  </Box>
                ))}
                {changedFields.length > 6 ? (
                  <Typography color="text.secondary" variant="body2">
                    {changedFields.length - 6} cambios adicionales en JSON completo.
                  </Typography>
                ) : null}
              </Stack>
            ) : (
              <Typography color="text.secondary">
                No se detectaron diferencias campo a campo para este evento.
              </Typography>
            )}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2 }} variant="outlined">
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <StorageIcon color="primary" fontSize="small" />
              <Typography component="h4" variant="subtitle1">
                Huella tecnica
              </Typography>
            </Stack>
            <Typography color="text.secondary">
              Registro conservado con estado anterior y posterior para trazabilidad operativa.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              <Chip label={`Entidad: ${audit.entidad}`} size="small" />
              <Chip label={`Accion: ${audit.accion}`} size="small" />
              <Chip label={`Usuario: ${audit.usuario}`} size="small" />
            </Stack>
          </Stack>
        </Paper>
      </Box>

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
    </Paper>
  );
}
