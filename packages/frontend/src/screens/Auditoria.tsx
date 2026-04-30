import { useMemo, useState } from "react";
import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

import { AuditDetail } from "../components/Audit/AuditDetail";
import { Badge } from "../components/Common/Badge";
import { DataTable } from "../components/Common/DataTable";
import { SearchBar } from "../components/Common/SearchBar";
import type { AuditRow, BadgeTone } from "../types";

const ALL_OPTION = "todos";

const csvRow = (values: unknown[]): string =>
  values
    .map((value) => {
      const text = value === null || value === undefined ? "" : String(value);
      return `"${text.replaceAll('"', '""')}"`;
    })
    .join(",");

const formatJsonForExport = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
};

const getActionTone = (action: string): BadgeTone => {
  const normalizedAction = action.toLowerCase();

  if (normalizedAction.includes("cre") || normalizedAction.includes("insert")) {
    return "success";
  }

  if (normalizedAction.includes("edit") || normalizedAction.includes("updat") || normalizedAction.includes("mod")) {
    return "info";
  }

  if (normalizedAction.includes("delete") || normalizedAction.includes("elim") || normalizedAction.includes("anul")) {
    return "warning";
  }

  return "neutral";
};

export function AuditoriaScreen({ auditoria }: { auditoria: AuditRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState(ALL_OPTION);
  const [actionFilter, setActionFilter] = useState(ALL_OPTION);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(auditoria[0]?.id ?? null);

  const entityOptions = useMemo(
    () => [...new Set(auditoria.map((audit) => audit.entidad).filter(Boolean))].sort(),
    [auditoria],
  );
  const actionOptions = useMemo(
    () => [...new Set(auditoria.map((audit) => audit.accion).filter(Boolean))].sort(),
    [auditoria],
  );

  const filteredAudit = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    return auditoria.filter((audit) =>
      (entityFilter === ALL_OPTION || audit.entidad === entityFilter) &&
      (actionFilter === ALL_OPTION || audit.accion === actionFilter) &&
      (!normalizedQuery ||
      [audit.fecha, audit.usuario, audit.entidad, audit.entidadId, audit.accion, audit.ipOrigen]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)),
    );
  }, [actionFilter, auditoria, entityFilter, searchTerm]);

  const uniqueUsers = useMemo(
    () => new Set(filteredAudit.map((audit) => audit.usuario)).size,
    [filteredAudit],
  );
  const eventsWithIp = filteredAudit.filter((audit) => audit.ipOrigen).length;
  const hasActiveFilters =
    searchTerm.trim().length > 0 || entityFilter !== ALL_OPTION || actionFilter !== ALL_OPTION;

  const selectedAudit =
    filteredAudit.find((audit) => audit.id === selectedAuditId) ??
    auditoria.find((audit) => audit.id === selectedAuditId) ??
    filteredAudit[0] ??
    null;

  const clearFilters = () => {
    setSearchTerm("");
    setEntityFilter(ALL_OPTION);
    setActionFilter(ALL_OPTION);
  };

  const exportFilteredAudit = () => {
    const header = csvRow([
      "Fecha",
      "Usuario",
      "Entidad",
      "Entidad ID",
      "Accion",
      "IP origen",
      "Datos antes",
      "Datos despues",
    ]);
    const rows = filteredAudit.map((audit) =>
      csvRow([
        audit.fecha,
        audit.usuario,
        audit.entidad,
        audit.entidadId ?? "",
        audit.accion,
        audit.ipOrigen ?? "",
        formatJsonForExport(audit.dataAntes),
        formatJsonForExport(audit.dataDespues),
      ]),
    );
    const blob = new Blob([[header, ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stack">
      <Paper className="panel" component="section" variant="outlined">
        <Stack direction={{ md: "row", xs: "column" }} spacing={2} sx={{ alignItems: { md: "center", xs: "stretch" }, justifyContent: "space-between" }}>
          <Box>
            <Typography color="text.secondary" sx={{ fontSize: 12, fontWeight: 850, letterSpacing: 0.6, textTransform: "uppercase" }}>
              Control interno
            </Typography>
            <Typography component="h2" sx={{ fontWeight: 900, mt: 0.5 }} variant="h5">
              Bitacora de auditoria
            </Typography>
            <Typography color="text.secondary">
              Revision de eventos, usuarios y cambios sensibles registrados por el sistema.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip color="primary" label={`${filteredAudit.length} eventos`} variant="outlined" />
            <Chip color="info" label={`${uniqueUsers} usuarios`} variant="outlined" />
            <Chip color="success" label={`${eventsWithIp} con IP`} variant="outlined" />
          </Stack>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { lg: "repeat(4, minmax(0, 1fr))", sm: "repeat(2, minmax(0, 1fr))", xs: "1fr" },
            mt: 3,
          }}
        >
          {[
            { icon: <FactCheckIcon fontSize="small" />, label: "Eventos filtrados", value: filteredAudit.length },
            { icon: <PersonSearchIcon fontSize="small" />, label: "Usuarios involucrados", value: uniqueUsers },
            { icon: <FingerprintIcon fontSize="small" />, label: "Entidades auditadas", value: entityOptions.length },
            { icon: <ManageSearchIcon fontSize="small" />, label: "Tipos de accion", value: actionOptions.length },
          ].map((metric) => (
            <Paper key={metric.label} sx={{ p: 2, height: "100%" }} variant="outlined">
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "primary.main" }}>
                  {metric.icon}
                  <Typography color="text.secondary" variant="body2">
                    {metric.label}
                  </Typography>
                </Stack>
                <Typography component="strong" sx={{ fontSize: 28, fontWeight: 900 }}>
                  {metric.value}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Paper>

      <DataTable
        title="Auditoria"
        description="Eventos relevantes con detalle navegable del cambio registrado."
        headers={["Fecha", "Usuario", "Entidad", "Accion", "Origen", "Detalle"]}
        actions={
          <Stack direction={{ md: "row", xs: "column" }} spacing={1.5} sx={{ alignItems: { md: "center", xs: "stretch" } }}>
            <SearchBar
              onChange={setSearchTerm}
              placeholder="Usuario, entidad, accion, id..."
              value={searchTerm}
            />
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="audit-entity-filter-label">Entidad</InputLabel>
              <Select
                label="Entidad"
                labelId="audit-entity-filter-label"
                onChange={(event) => setEntityFilter(event.target.value)}
                value={entityFilter}
              >
                <MenuItem value={ALL_OPTION}>Todas</MenuItem>
                {entityOptions.map((entity) => (
                  <MenuItem key={entity} value={entity}>
                    {entity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="audit-action-filter-label">Accion</InputLabel>
              <Select
                label="Accion"
                labelId="audit-action-filter-label"
                onChange={(event) => setActionFilter(event.target.value)}
                value={actionFilter}
              >
                <MenuItem value={ALL_OPTION}>Todas</MenuItem>
                {actionOptions.map((action) => (
                  <MenuItem key={action} value={action}>
                    {action}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              disabled={filteredAudit.length === 0}
              onClick={exportFilteredAudit}
              startIcon={<DownloadIcon />}
              variant="contained"
            >
              Exportar
            </Button>
            <Button
              disabled={!hasActiveFilters}
              onClick={clearFilters}
              startIcon={<FilterAltOffIcon />}
              variant="outlined"
            >
              Limpiar
            </Button>
          </Stack>
        }
        emptyMessage="No hay eventos de auditoria que coincidan con la busqueda."
        rows={filteredAudit.map((audit) => [
          audit.fecha,
          audit.usuario,
          <div key={`${audit.id}-entity`}>
            <strong>{audit.entidad}</strong>
            <p className="muted-text">{audit.entidadId ?? "Sin identificador"}</p>
          </div>,
          <Badge key={`${audit.id}-action`} tone={getActionTone(audit.accion)}>
            {audit.accion}
          </Badge>,
          audit.ipOrigen ?? "-",
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
