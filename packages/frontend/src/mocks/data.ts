import type { BadgeTone } from "../types";

export function resolveTone(status: string): BadgeTone {
  const normalized = status.trim().toUpperCase();

  if (
    normalized === "APROBADO" ||
    normalized === "APROBADA" ||
    normalized === "PAGADA" ||
    normalized === "ACTIVO" ||
    normalized === "ENT" ||
    normalized === "IN"
  ) {
    return "success";
  }

  if (
    normalized === "PARCIAL" ||
    normalized === "PENDIENTE" ||
    normalized === "BORRADOR" ||
    normalized === "SAL" ||
    normalized === "OUT"
  ) {
    return "warning";
  }

  return "info";
}
