const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIT_RUT_PATTERN = /^[A-Z0-9-]{5,20}$/i;
const PHONE_ALLOWED_PATTERN = /^\+?[0-9()\s-]+$/;
const UNIT_PATTERN = /^[A-Z]{2,10}$/i;

const buildCodePattern = (maxLength: number): RegExp =>
  new RegExp(`^[A-Z0-9](?:[A-Z0-9._/-]{1,${maxLength - 1}})$`, "i");

export const hasValidationErrors = <T extends string>(errors: Partial<Record<T, string>>): boolean =>
  Object.values(errors).some((value) => typeof value === "string" && value.trim().length > 0);

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim());

export const isValidEntityCode = (value: string, maxLength = 30): boolean =>
  buildCodePattern(maxLength).test(value.trim());

export const isValidNitRut = (value: string): boolean => NIT_RUT_PATTERN.test(value.trim());

export const isValidPhone = (value: string): boolean => {
  const trimmed = value.trim();
  if (!PHONE_ALLOWED_PATTERN.test(trimmed)) {
    return false;
  }

  const digitCount = trimmed.replace(/\D/g, "").length;
  return digitCount >= 7 && digitCount <= 15;
};

export const isValidUnitCode = (value: string): boolean => UNIT_PATTERN.test(value.trim());

export const parseNumberInput = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

export const isValidDateInputValue = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const isValidDateTimeLocalValue = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};
