import { describe, expect, it } from "bun:test";

import {
  hasValidationErrors,
  isValidDateInputValue,
  isValidDateTimeLocalValue,
  isValidEmail,
  isValidEntityCode,
  isValidNitRut,
  isValidPhone,
  isValidUnitCode,
  parseNumberInput,
} from "./validation";

describe("validation utils", () => {
  it("detecta errores presentes en un mapa de validacion", () => {
    expect(hasValidationErrors({ nombre: "" })).toBe(false);
    expect(hasValidationErrors({ nombre: "Requerido" })).toBe(true);
  });

  it("valida correos, codigos, NIT y unidades", () => {
    expect(isValidEmail("compras@erp.local")).toBe(true);
    expect(isValidEmail("correo-invalido")).toBe(false);
    expect(isValidEntityCode("PR-001", 20)).toBe(true);
    expect(isValidEntityCode("?", 20)).toBe(false);
    expect(isValidNitRut("12345-6")).toBe(true);
    expect(isValidNitRut("12")).toBe(false);
    expect(isValidUnitCode("UNI")).toBe(true);
    expect(isValidUnitCode("1")).toBe(false);
  });

  it("valida telefonos, numeros y fechas", () => {
    expect(isValidPhone("+591 71234567")).toBe(true);
    expect(isValidPhone("abc")).toBe(false);
    expect(isValidPhone("++++")).toBe(false);
    expect(parseNumberInput("15.5")).toBe(15.5);
    expect(parseNumberInput("")).toBeNull();
    expect(parseNumberInput("nope")).toBeNull();
    expect(isValidDateInputValue("2026-04-21")).toBe(true);
    expect(isValidDateInputValue("2026-99-21")).toBe(false);
    expect(isValidDateInputValue("20260421")).toBe(false);
    expect(isValidDateTimeLocalValue("2026-04-21T10:30")).toBe(true);
    expect(isValidDateTimeLocalValue("2026-04-21")).toBe(false);
    expect(isValidDateTimeLocalValue("2026-04-21T25:61")).toBe(false);
  });
});
