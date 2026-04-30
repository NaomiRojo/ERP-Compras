import type { CrearArticuloDto } from "src/application/dtos/articulo/CrearArticuloDto";
import type { LoginDto } from "src/application/dtos/auth/LoginDto";
import type { LoginGoogleDto } from "src/application/dtos/auth/LoginGoogleDto";
import type { RefreshAccessTokenDto } from "src/application/dtos/auth/RefreshAccessTokenDto";
import type { ResendSecondFactorDto } from "src/application/dtos/auth/ResendSecondFactorDto";
import type { RegisterUsuarioDto } from "src/application/dtos/auth/RegisterUsuarioDto";
import type { VerifySecondFactorDto } from "src/application/dtos/auth/VerifySecondFactorDto";
import type { CrearCuentaPorPagarDto } from "src/application/dtos/cxp/CrearCuentaPorPagarDto";
import type { RegistrarPagoProveedorDto } from "src/application/dtos/cxp/RegistrarPagoProveedorDto";
import type { ActualizarOrdenCompraDto } from "src/application/dtos/orden-compra/ActualizarOrdenCompraDto";
import type { CrearOrdenCompraDto } from "src/application/dtos/orden-compra/CrearOrdenCompraDto";
import type { RegistrarRecepcionOrdenCompraDto } from "src/application/dtos/orden-compra/RegistrarRecepcionOrdenCompraDto";
import type { CrearProveedorDto } from "src/application/dtos/proveedor/CrearProveedorDto";
import {
  SEGUNDO_FACTOR_CANALES_ENTREGA,
  type SegundoFactorCanalEntrega,
} from "src/domain/entities/SegundoFactorCanal";

type JsonObject = Record<string, unknown>;

const asObject = (value: unknown): JsonObject => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Solicitud invalida");
  }

  return value as JsonObject;
};

const readRequiredString = (
  object: JsonObject,
  key: string,
  requiredMessage: string,
): string => {
  const value = object[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(requiredMessage);
  }

  return value.trim();
};

const readOptionalString = (object: JsonObject, key: string): string | undefined => {
  const value = object[key];
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error("Solicitud invalida");
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const readRequiredNumber = (object: JsonObject, key: string): number => {
  const value = object[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Solicitud invalida");
  }

  return value;
};

const readOptionalNumber = (object: JsonObject, key: string): number | undefined => {
  const value = object[key];
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Solicitud invalida");
  }

  return value;
};

const readOptionalBoolean = (object: JsonObject, key: string): boolean | undefined => {
  const value = object[key];
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new Error("Solicitud invalida");
  }

  return value;
};

const isTwoFactorDeliveryChannel = (value: string): value is SegundoFactorCanalEntrega =>
  (SEGUNDO_FACTOR_CANALES_ENTREGA as readonly string[]).includes(value);

const readOptionalTwoFactorChannel = (
  object: JsonObject,
  key: string,
): SegundoFactorCanalEntrega | undefined => {
  const value = object[key];
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error("Solicitud invalida");
  }

  const normalized = value.trim().toUpperCase();
  if (!isTwoFactorDeliveryChannel(normalized)) {
    throw new Error("twoFactorChannel debe ser EMAIL, SMS, WHATSAPP o VOICE");
  }

  return normalized;
};

export const validateRegisterUsuarioDto = (value: unknown): RegisterUsuarioDto => {
  const body = asObject(value);

  return {
    username: readRequiredString(
      body,
      "username",
      "username, nombreCompleto, email y password son obligatorios",
    ),
    nombreCompleto: readRequiredString(
      body,
      "nombreCompleto",
      "username, nombreCompleto, email y password son obligatorios",
    ),
    email: readRequiredString(
      body,
      "email",
      "username, nombreCompleto, email y password son obligatorios",
    ),
    password: readRequiredString(
      body,
      "password",
      "username, nombreCompleto, email y password son obligatorios",
    ),
    rolId: readOptionalNumber(body, "rolId"),
    twoFactorEnabled: readOptionalBoolean(body, "twoFactorEnabled"),
  };
};

export const validateLoginDto = (value: unknown): LoginDto => {
  const body = asObject(value);

  return {
    email: readRequiredString(body, "email", "email y password son obligatorios"),
    password: readRequiredString(body, "password", "email y password son obligatorios"),
    twoFactorChannel: readOptionalTwoFactorChannel(body, "twoFactorChannel"),
    twoFactorPhoneNumber: readOptionalString(body, "twoFactorPhoneNumber"),
  };
};

export const validateLoginGoogleDto = (value: unknown): LoginGoogleDto => {
  const body = asObject(value);

  return {
    credential: readRequiredString(body, "credential", "credential es obligatorio"),
    twoFactorChannel: readOptionalTwoFactorChannel(body, "twoFactorChannel"),
    twoFactorPhoneNumber: readOptionalString(body, "twoFactorPhoneNumber"),
  };
};

export const validateVerifySecondFactorDto = (value: unknown): VerifySecondFactorDto => {
  const body = asObject(value);

  return {
    challengeId: readRequiredString(body, "challengeId", "challengeId y code son obligatorios"),
    code: readRequiredString(body, "code", "challengeId y code son obligatorios"),
  };
};

export const validateResendSecondFactorDto = (value: unknown): ResendSecondFactorDto => {
  const body = asObject(value);

  return {
    challengeId: readRequiredString(body, "challengeId", "challengeId es obligatorio"),
  };
};

export const validateRefreshAccessTokenDto = (value: unknown): RefreshAccessTokenDto => {
  const body = asObject(value);

  return {
    refreshToken: readRequiredString(body, "refreshToken", "refreshToken es obligatorio"),
  };
};

export const validateCrearProveedorDto = (value: unknown): CrearProveedorDto => {
  const body = asObject(value);

  return {
    cardCode: readRequiredString(body, "cardCode", "cardCode, cardName y nitRut son obligatorios"),
    cardName: readRequiredString(body, "cardName", "cardCode, cardName y nitRut son obligatorios"),
    nombreComercial: readOptionalString(body, "nombreComercial"),
    nitRut: readRequiredString(body, "nitRut", "cardCode, cardName y nitRut son obligatorios"),
    email: readOptionalString(body, "email"),
    telefono: readOptionalString(body, "telefono"),
    direccion: readOptionalString(body, "direccion"),
    monedaId: readRequiredNumber(body, "monedaId"),
    lineaCredito: readOptionalNumber(body, "lineaCredito"),
  };
};

export const validateCrearArticuloDto = (value: unknown): CrearArticuloDto => {
  const body = asObject(value);

  return {
    itemCode: readRequiredString(body, "itemCode", "itemCode e itemName son obligatorios"),
    itemName: readRequiredString(body, "itemName", "itemCode e itemName son obligatorios"),
    descripcion: readOptionalString(body, "descripcion"),
    unidadMedida: readOptionalString(body, "unidadMedida"),
    costoEstandar: readRequiredNumber(body, "costoEstandar"),
    grupoId: readRequiredNumber(body, "grupoId"),
    impuestoId: readRequiredNumber(body, "impuestoId"),
  };
};

const validateOrdenCompraDetalle = (value: unknown): CrearOrdenCompraDto["detalles"][number] => {
  const detail = asObject(value);

  return {
    articuloId: readRequiredString(detail, "articuloId", "Solicitud invalida"),
    almacenId: readRequiredString(detail, "almacenId", "Solicitud invalida"),
    impuestoId: readRequiredNumber(detail, "impuestoId"),
    descripcion: readOptionalString(detail, "descripcion"),
    cantidadTotal: readRequiredNumber(detail, "cantidadTotal"),
    precioUnitario: readRequiredNumber(detail, "precioUnitario"),
    descuentoLinea: readOptionalNumber(detail, "descuentoLinea"),
  };
};

export const validateCrearOrdenCompraDto = (value: unknown): CrearOrdenCompraDto => {
  const body = asObject(value);

  const proveedorId = readRequiredString(
    body,
    "proveedorId",
    "proveedorId y detalles son obligatorios",
  );
  const detallesValue = body.detalles;
  if (!Array.isArray(detallesValue) || detallesValue.length === 0) {
    throw new Error("proveedorId y detalles son obligatorios");
  }

  return {
    proveedorId,
    monedaId: readRequiredNumber(body, "monedaId"),
    fechaDocumento: readRequiredString(body, "fechaDocumento", "Solicitud invalida"),
    fechaVencimiento: readOptionalString(body, "fechaVencimiento"),
    comentarios: readOptionalString(body, "comentarios"),
    detalles: detallesValue.map(validateOrdenCompraDetalle),
  };
};

export const validateActualizarOrdenCompraDto = (value: unknown): ActualizarOrdenCompraDto =>
  validateCrearOrdenCompraDto(value);

const validateRecepcionOrdenCompraDetalle = (
  value: unknown,
): RegistrarRecepcionOrdenCompraDto["detalles"][number] => {
  const detail = asObject(value);

  return {
    lineNum: readRequiredNumber(detail, "lineNum"),
    cantidadRecibida: readRequiredNumber(detail, "cantidadRecibida"),
  };
};

export const validateRegistrarRecepcionOrdenCompraDto = (
  value: unknown,
): RegistrarRecepcionOrdenCompraDto => {
  const body = asObject(value);

  const detallesValue = body.detalles;
  if (!Array.isArray(detallesValue) || detallesValue.length === 0) {
    throw new Error("La recepcion requiere al menos un detalle");
  }

  return {
    fechaDocumento: readRequiredString(body, "fechaDocumento", "fechaDocumento es obligatorio"),
    comentarios: readOptionalString(body, "comentarios"),
    detalles: detallesValue.map(validateRecepcionOrdenCompraDetalle),
  };
};

export const validateCrearCuentaPorPagarDto = (value: unknown): CrearCuentaPorPagarDto => {
  const body = asObject(value);

  return {
    compraId: readRequiredString(
      body,
      "compraId",
      "compraId, proveedorId y numeroFactura son obligatorios",
    ),
    proveedorId: readRequiredString(
      body,
      "proveedorId",
      "compraId, proveedorId y numeroFactura son obligatorios",
    ),
    numeroFactura: readRequiredString(
      body,
      "numeroFactura",
      "compraId, proveedorId y numeroFactura son obligatorios",
    ),
    montoTotal: readRequiredNumber(body, "montoTotal"),
    fechaVencimiento: readRequiredString(
      body,
      "fechaVencimiento",
      "fechaVencimiento es obligatorio",
    ),
  };
};

export const validateRegistrarPagoProveedorDto = (value: unknown): RegistrarPagoProveedorDto => {
  const body = asObject(value);

  return {
    monto: readRequiredNumber(body, "monto"),
    fechaPago: readRequiredString(body, "fechaPago", "fechaPago es obligatorio"),
    referencia: readOptionalString(body, "referencia"),
  };
};
