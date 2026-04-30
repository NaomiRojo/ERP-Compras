import { useMemo, useState } from "react";

import { DataTable } from "../components/Common/DataTable";
import type { Payment } from "../types";
import type { RegistrarPagoProveedorDto } from "../types/api";
import {
  hasValidationErrors,
  isValidDateTimeLocalValue,
  isValidEntityCode,
  parseNumberInput,
} from "../utils/validation";

type CuentaPagoOption = {
  id: string;
  label: string;
};

type PagosScreenProps = {
  pagos: Payment[];
  canRegister: boolean;
  cuentasPago: CuentaPagoOption[];
  onRegister: (cuentaPorPagarId: string, payload: RegistrarPagoProveedorDto) => Promise<void>;
};

type PaymentFormState = {
  cuentaId: string;
  monto: string;
  fechaPago: string;
  referencia: string;
};

type PaymentField = keyof PaymentFormState;
type PaymentFieldErrors = Partial<Record<PaymentField, string>>;

const FORM_VALIDATION_MESSAGE = "Corrige los campos marcados para continuar.";

const currentDateTimeInputValue = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const buildEmptyForm = (cuentasPago: CuentaPagoOption[]): PaymentFormState => ({
  cuentaId: cuentasPago[0]?.id ?? "",
  monto: "0",
  fechaPago: currentDateTimeInputValue(),
  referencia: "",
});

const validatePaymentForm = (
  form: PaymentFormState,
  cuentasPago: CuentaPagoOption[],
): PaymentFieldErrors => {
  const errors: PaymentFieldErrors = {};

  if (!cuentasPago.some((cuenta) => cuenta.id === form.cuentaId)) {
    errors.cuentaId = "Selecciona una cuenta por pagar valida.";
  }

  const monto = parseNumberInput(form.monto);
  if (monto === null || monto <= 0) {
    errors.monto = "Ingresa un monto mayor a 0.";
  }

  if (!form.fechaPago) {
    errors.fechaPago = "Ingresa la fecha del pago.";
  } else if (!isValidDateTimeLocalValue(form.fechaPago)) {
    errors.fechaPago = "Ingresa una fecha y hora validas.";
  }

  if (form.referencia.trim() && !isValidEntityCode(form.referencia, 60)) {
    errors.referencia = "Usa 2-60 caracteres validos.";
  }

  return errors;
};

export function PagosScreen({ pagos, canRegister, cuentasPago, onRegister }: PagosScreenProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationActive, setValidationActive] = useState(false);
  const [form, setForm] = useState<PaymentFormState>(() => buildEmptyForm(cuentasPago));

  const fieldErrors = useMemo(() => validatePaymentForm(form, cuentasPago), [cuentasPago, form]);

  const resetForm = () => {
    setForm(buildEmptyForm(cuentasPago));
    setValidationActive(false);
    setErrorMessage(null);
  };

  const updateField = <K extends keyof PaymentFormState>(field: K, value: PaymentFormState[K]) => {
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
      const payload: RegistrarPagoProveedorDto = {
        monto: parseNumberInput(form.monto) ?? 0,
        fechaPago: new Date(form.fechaPago).toISOString(),
        referencia: form.referencia.trim() || undefined,
      };

      await onRegister(form.cuentaId, payload);
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo registrar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showFieldError = (field: PaymentField): string | undefined =>
    validationActive ? fieldErrors[field] : undefined;

  return (
    <div className="stack">
      <DataTable
        title="Pagos"
        description="Historico de transacciones registradas."
        headers={["Fecha", "Proveedor", "Referencia", "Monto", "Usuario"]}
        actions={
          canRegister ? (
            <button
              className="primary-button"
              onClick={() => {
                setErrorMessage(null);
                setValidationActive(false);
                setIsFormVisible((value) => !value);
              }}
              type="button"
            >
              {isFormVisible ? "Cerrar" : "Registrar pago"}
            </button>
          ) : null
        }
        rows={pagos.map((payment) => [
          payment.fecha,
          payment.proveedor,
          payment.referencia,
          `${payment.monto.toLocaleString()}`,
          payment.usuario,
        ])}
      />

      {canRegister && isFormVisible ? (
        <section className="panel">
          <div className="panel__header">
            <div>
              <h3>Registrar pago</h3>
              <p>Registra un pago aplicado a una cuenta por pagar.</p>
            </div>
          </div>

          <form className="inline-form" noValidate onSubmit={submit}>
            <label>
              Cuenta por pagar
              <select
                aria-invalid={showFieldError("cuentaId") ? true : undefined}
                className={showFieldError("cuentaId") ? "field-invalid" : undefined}
                onChange={(event) => updateField("cuentaId", event.target.value)}
                required
                value={form.cuentaId}
              >
                {cuentasPago.map((cuenta) => (
                  <option key={cuenta.id} value={cuenta.id}>
                    {cuenta.label}
                  </option>
                ))}
              </select>
              {showFieldError("cuentaId") ? <p className="field-error">{showFieldError("cuentaId")}</p> : null}
            </label>
            <label>
              Monto
              <input
                aria-invalid={showFieldError("monto") ? true : undefined}
                className={showFieldError("monto") ? "field-invalid" : undefined}
                min="0"
                onChange={(event) => updateField("monto", event.target.value)}
                required
                step="0.01"
                type="number"
                value={form.monto}
              />
              {showFieldError("monto") ? <p className="field-error">{showFieldError("monto")}</p> : null}
            </label>
            <label>
              Fecha de pago
              <input
                aria-invalid={showFieldError("fechaPago") ? true : undefined}
                className={showFieldError("fechaPago") ? "field-invalid" : undefined}
                onChange={(event) => updateField("fechaPago", event.target.value)}
                required
                type="datetime-local"
                value={form.fechaPago}
              />
              {showFieldError("fechaPago") ? <p className="field-error">{showFieldError("fechaPago")}</p> : null}
            </label>
            <label>
              Referencia
              <input
                aria-invalid={showFieldError("referencia") ? true : undefined}
                className={showFieldError("referencia") ? "field-invalid" : undefined}
                onChange={(event) => updateField("referencia", event.target.value)}
                value={form.referencia}
              />
              {showFieldError("referencia") ? (
                <p className="field-error">{showFieldError("referencia")}</p>
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
