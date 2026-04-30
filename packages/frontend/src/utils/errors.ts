import { ApiError } from "../api/http";

const friendlyMessageByStatus: Partial<Record<number, string>> = {
  0: "No hay conexion con el servidor. Revisa que Docker y el backend esten levantados.",
  400: "Hay datos incompletos o invalidos. Revisa los campos marcados.",
  401: "Tu sesion expiro. Inicia sesion nuevamente.",
  403: "No tienes permisos para realizar esta accion.",
  404: "No encontramos el recurso solicitado.",
  409: "La operacion no se pudo completar porque los datos ya cambiaron o existen duplicados.",
  500: "El servidor tuvo un problema interno. Intenta nuevamente en unos minutos.",
};

const normalizeKnownBackendMessage = (message: string): string => {
  const normalized = message.trim();

  if (!normalized || normalized.startsWith("Error HTTP")) {
    return "";
  }

  if (normalized.toLowerCase().includes("failed to fetch")) {
    return friendlyMessageByStatus[0]!;
  }

  if (normalized.toLowerCase().includes("twilio respondio")) {
    return "No se pudo enviar el codigo 2FA por Twilio. Revisa el numero, el canal elegido y la configuracion de Twilio.";
  }

  if (normalized.toLowerCase().includes("no se pudo conectar con twilio")) {
    return "No se pudo conectar con Twilio para enviar el codigo 2FA. Intenta de nuevo o usa otro canal.";
  }

  return normalized;
};

export const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return normalizeKnownBackendMessage(error.message) || friendlyMessageByStatus[error.status] || error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return normalizeKnownBackendMessage(error.message) || error.message;
  }

  return "No se pudo completar la operacion";
};
