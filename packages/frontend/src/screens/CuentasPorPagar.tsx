import { useMemo, useState } from "react";

import { Badge } from "../components/Common/Badge";
import { DataTable } from "../components/Common/DataTable";
import { PermissionGate } from "../components/Common/PermissionGate";
import { SearchBar } from "../components/Common/SearchBar";
import { resolveTone } from "../mocks/data";
import type { AccountsPayable } from "../types";
import type { CrearCuentaPorPagarDto } from "../types/api";
import {
  hasValidationErrors,
  isValidDateInputValue,
  isValidEntityCode,
  parseNumberInput,
} from "../utils/validation";

type OrdenFacturaOption = {
  id: string;
  proveedorId: string;
  label: string;
};

type CuentasPorPagarScreenProps = {
  cuentas: AccountsPayable[];
  canRegister: boolean;
  ordenesFactura: OrdenFacturaOption[];
  onRegister: (payload: CrearCuentaPorPagarDto) => Promise<void>;
};

type CxpFormState = {
  compraId: string;
  numeroFactura: string;
  montoTotal: string;
  fechaVencimiento: string;
};

type CxpField = keyof CxpFormState;
type CxpFieldErrors = Partial<Record<CxpField, string>>;

const FORM_VALIDATION_MESSAGE = "Corrige los campos marcados para continuar.";

const buildEmptyForm = (ordenesFactura: OrdenFacturaOption[]): CxpFormState => ({
  compraId: ordenesFactura[0]?.id ?? "",
  numeroFactura: "",
  montoTotal: "0",
  fechaVencimiento: "",
});

const validateCxpForm = (form: CxpFormState, ordenesFactura: OrdenFacturaOption[]): CxpFieldErrors => {
  const errors: CxpFieldErrors = {};

  if (!ordenesFactura.some((orden) => orden.id === form.compraId)) {
    errors.compraId = "Selecciona una orden valida.";
  }

  if (!form.numeroFactura.trim()) {
    errors.numeroFactura = "Ingresa el numero de factura.";
  } else if (!isValidEntityCode(form.numeroFactura, 40)) {
    errors.numeroFactura = "Usa 2-40 caracteres validos.";
  }

  const montoTotal = parseNumberInput(form.montoTotal);
  if (montoTotal === null || montoTotal <= 0) {
    errors.montoTotal = "Ingresa un monto mayor a 0.";
  }

  if (!form.fechaVencimiento) {
    errors.fechaVencimiento = "Ingresa la fecha de vencimiento.";
  } else if (!isValidDateInputValue(form.fechaVencimiento)) {
    errors.fechaVencimiento = "Ingresa una fecha valida.";
  }

  return errors;
};

const readInitialSearchTerm = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const hashQuery = window.location.hash.split("?")[1] ?? "";
  const params = new URLSearchParams(hashQuery || window.location.search);
  return params.get("q") ?? "";
};

export function CuentasPorPagarScreen({
  cuentas,
  canRegister,
  ordenesFactura,
  onRegister,
}: CuentasPorPagarScreenProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState(readInitialSearchTerm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationActive, setValidationActive] = useState(false);
  const [form, setForm] = useState<CxpFormState>(() => buildEmptyForm(ordenesFactura));

  const fieldErrors = useMemo(() => validateCxpForm(form, ordenesFactura), [form, ordenesFactura]);
  const proveedorId = useMemo(
    () => ordenesFactura.find((orden) => orden.id === form.compraId)?.proveedorId ?? "",
    [form.compraId, ordenesFactura],
  );
  const filteredCuentas = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) {
      return cuentas;
    }

    return cuentas.filter((cuenta) =>
      [
        cuenta.proveedor,
        cuenta.factura,
        cuenta.estado,
        cuenta.vencimiento,
        String(cuenta.total),
        String(cuenta.saldo),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [cuentas, searchTerm]);

  const resetForm = () => {
    setForm(buildEmptyForm(ordenesFactura));
    setValidationActive(false);
    setErrorMessage(null);
  };

  const updateField = <K extends keyof CxpFormState>(field: K, value: CxpFormState[K]) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errorMessage === FORM_VALIDATION_MESSAGE) {
      setErrorMessage(null);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationActive(true);
    setErrorMessage(null);

    if (hasValidationErrors(fieldErrors)) {
      setErrorMessage(FORM_VALIDATION_MESSAGE);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!proveedorId) {
        throw new Error("Selecciona una orden valida");
      }

      const payload: CrearCuentaPorPagarDto = {
        compraId: form.compraId,
        proveedorId,
        numeroFactura: form.numeroFactura.trim(),
        montoTotal: parseNumberInput(form.montoTotal) ?? 0,
        fechaVencimiento: form.fechaVencimiento,
      };

      await onRegister(payload);
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo registrar la cuenta por pagar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showFieldError = (field: CxpField): string | undefined =>
    validationActive ? fieldErrors[field] : undefined;

  return (
    <div className="stack">
      <DataTable
        title="Cuentas por pagar"
        description="Facturas pendientes y saldos."
        headers={["Proveedor", "Factura", "Total", "Saldo", "Vencimiento", "Estado"]}
        actions={
          <div className="action-row">
            <SearchBar
              onChange={setSearchTerm}
              placeholder="Proveedor, factura, estado..."
              value={searchTerm}
            />
            <PermissionGate disabled={!canRegister} reason="Tu rol no tiene permiso para registrar facturas.">
              <button
                className="primary-button"
                disabled={!canRegister}
                onClick={() => {
                  setErrorMessage(null);
                  setValidationActive(false);
                  setIsFormVisible((value) => !value);
                }}
                type="button"
              >
                {isFormVisible ? "Cerrar" : "Registrar factura"}
              </button>
            </PermissionGate>
          </div>
        }
        emptyMessage="No hay cuentas por pagar que coincidan con la busqueda."
        rows={filteredCuentas.map((item) => [
          item.proveedor,
          item.factura,
          `${item.total.toLocaleString()}`,
          `${item.saldo.toLocaleString()}`,
          item.vencimiento,
          <Badge key={`${item.id}-estado`} tone={resolveTone(item.estado)}>
            {item.estado}
          </Badge>,
        ])}
      />

      {canRegister && isFormVisible ? (
        <section className="panel">
          <div className="panel__header">
            <div>
              <h3>Registrar factura de proveedor</h3>
              <p>Crea una cuenta por pagar vinculada a una orden de compra.</p>
            </div>
          </div>

          <form className="inline-form" noValidate onSubmit={submit}>
            <label>
              Orden de compra
              <select
                aria-invalid={showFieldError("compraId") ? true : undefined}
                className={showFieldError("compraId") ? "field-invalid" : undefined}
                onChange={(event) => updateField("compraId", event.target.value)}
                required
                value={form.compraId}
              >
                {ordenesFactura.map((orden) => (
                  <option key={orden.id} value={orden.id}>
                    {orden.label}
                  </option>
                ))}
              </select>
              {showFieldError("compraId") ? <p className="field-error">{showFieldError("compraId")}</p> : null}
            </label>
            <label>
              Numero de factura
              <input
                aria-invalid={showFieldError("numeroFactura") ? true : undefined}
                className={showFieldError("numeroFactura") ? "field-invalid" : undefined}
                onChange={(event) => updateField("numeroFactura", event.target.value)}
                required
                value={form.numeroFactura}
              />
              {showFieldError("numeroFactura") ? (
                <p className="field-error">{showFieldError("numeroFactura")}</p>
              ) : null}
            </label>
            <label>
              Monto total
              <input
                aria-invalid={showFieldError("montoTotal") ? true : undefined}
                className={showFieldError("montoTotal") ? "field-invalid" : undefined}
                min="0"
                onChange={(event) => updateField("montoTotal", event.target.value)}
                required
                step="0.01"
                type="number"
                value={form.montoTotal}
              />
              {showFieldError("montoTotal") ? <p className="field-error">{showFieldError("montoTotal")}</p> : null}
            </label>
            <label>
              Fecha de vencimiento
              <input
                aria-invalid={showFieldError("fechaVencimiento") ? true : undefined}
                className={showFieldError("fechaVencimiento") ? "field-invalid" : undefined}
                onChange={(event) => updateField("fechaVencimiento", event.target.value)}
                required
                type="date"
                value={form.fechaVencimiento}
              />
              {showFieldError("fechaVencimiento") ? (
                <p className="field-error">{showFieldError("fechaVencimiento")}</p>
              ) : null}
            </label>

            {errorMessage ? <p className="auth-feedback auth-feedback--error">{errorMessage}</p> : null}

            <div className="inline-form__actions">
              <button className="primary-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Registrando..." : "Guardar"}
              </button>
              <button
                className="secondary-button"
                disabled={isSubmitting}
                onClick={() => {
                  resetForm();
                  setIsFormVisible(false);
                }}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
