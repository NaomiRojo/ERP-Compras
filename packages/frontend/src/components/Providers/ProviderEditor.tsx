import type { FormEvent } from "react";

import type { ProviderField, ProviderFormState } from "../../screens/Proveedores";
import { EditorPanel } from "../Common/EditorPanel";
import { FormActions } from "../Common/FormActions";
import { FormField } from "../Common/FormField";

type SelectOption = {
  value: number;
  label: string;
};

type ProviderEditorProps = {
  mode: "create" | "edit";
  form: ProviderFormState;
  monedaOptions: SelectOption[];
  errorMessage: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onFieldChange: <K extends ProviderField>(
    field: K,
    value: ProviderFormState[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  showFieldError: (field: ProviderField) => string | undefined;
};

export function ProviderEditor({
  mode,
  form,
  monedaOptions,
  errorMessage,
  isSubmitting,
  onCancel,
  onFieldChange,
  onSubmit,
  showFieldError,
}: ProviderEditorProps) {
  return (
    <EditorPanel
      description="Actualiza la informacion maestra que consume el resto del ERP."
      title={mode === "edit" ? "Editar proveedor" : "Registrar proveedor"}
    >
      <form className="inline-form inline-form--three" noValidate onSubmit={onSubmit}>
        <FormField error={showFieldError("cardCode")} label="Codigo">
          <input
            aria-invalid={showFieldError("cardCode") ? true : undefined}
            className={showFieldError("cardCode") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("cardCode", event.target.value)}
            required
            value={form.cardCode}
          />
        </FormField>
        <FormField error={showFieldError("cardName")} label="Nombre legal">
          <input
            aria-invalid={showFieldError("cardName") ? true : undefined}
            className={showFieldError("cardName") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("cardName", event.target.value)}
            required
            value={form.cardName}
          />
        </FormField>
        <FormField error={showFieldError("nombreComercial")} label="Nombre comercial">
          <input
            aria-invalid={showFieldError("nombreComercial") ? true : undefined}
            className={showFieldError("nombreComercial") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("nombreComercial", event.target.value)}
            value={form.nombreComercial}
          />
        </FormField>
        <FormField error={showFieldError("nitRut")} label="NIT/RUT">
          <input
            aria-invalid={showFieldError("nitRut") ? true : undefined}
            className={showFieldError("nitRut") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("nitRut", event.target.value)}
            required
            value={form.nitRut}
          />
        </FormField>
        <FormField error={showFieldError("monedaId")} label="Moneda">
          <select
            aria-invalid={showFieldError("monedaId") ? true : undefined}
            className={showFieldError("monedaId") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("monedaId", Number(event.target.value))}
            value={String(form.monedaId)}
          >
            {monedaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField error={showFieldError("lineaCredito")} label="Linea de credito">
          <input
            aria-invalid={showFieldError("lineaCredito") ? true : undefined}
            className={showFieldError("lineaCredito") ? "field-invalid" : undefined}
            min="0"
            onChange={(event) => onFieldChange("lineaCredito", event.target.value)}
            step="0.01"
            type="number"
            value={form.lineaCredito}
          />
        </FormField>
        <FormField error={showFieldError("email")} label="Email">
          <input
            aria-invalid={showFieldError("email") ? true : undefined}
            className={showFieldError("email") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("email", event.target.value)}
            type="email"
            value={form.email}
          />
        </FormField>
        <FormField error={showFieldError("telefono")} label="Telefono">
          <input
            aria-invalid={showFieldError("telefono") ? true : undefined}
            className={showFieldError("telefono") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("telefono", event.target.value)}
            value={form.telefono}
          />
        </FormField>
        <FormField error={showFieldError("direccion")} label="Direccion">
          <input
            aria-invalid={showFieldError("direccion") ? true : undefined}
            className={showFieldError("direccion") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("direccion", event.target.value)}
            value={form.direccion}
          />
        </FormField>

        {errorMessage ? <p className="auth-feedback auth-feedback--error">{errorMessage}</p> : null}

        <FormActions
          idlePrimaryLabel={mode === "edit" ? "Actualizar proveedor" : "Crear proveedor"}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          submittingPrimaryLabel="Guardando..."
        />
      </form>
    </EditorPanel>
  );
}
