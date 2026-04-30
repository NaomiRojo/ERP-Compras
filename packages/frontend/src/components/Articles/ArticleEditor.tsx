import type { FormEvent } from "react";

import type { ArticleField, ArticleFormState } from "../../screens/Articulos";
import { EditorPanel } from "../Common/EditorPanel";
import { FormActions } from "../Common/FormActions";
import { FormField } from "../Common/FormField";

type SelectOption = {
  value: number;
  label: string;
};

type ArticleEditorProps = {
  mode: "create" | "edit";
  form: ArticleFormState;
  grupoOptions: SelectOption[];
  impuestoOptions: SelectOption[];
  errorMessage: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onFieldChange: <K extends ArticleField>(
    field: K,
    value: ArticleFormState[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  showFieldError: (field: ArticleField) => string | undefined;
};

export function ArticleEditor({
  mode,
  form,
  grupoOptions,
  impuestoOptions,
  errorMessage,
  isSubmitting,
  onCancel,
  onFieldChange,
  onSubmit,
  showFieldError,
}: ArticleEditorProps) {
  return (
    <EditorPanel
      description="Los cambios impactan catalogo, ordenes y valorizacion de compras."
      title={mode === "edit" ? "Editar articulo" : "Registrar articulo"}
    >
      <form className="inline-form inline-form--three" noValidate onSubmit={onSubmit}>
        <FormField error={showFieldError("itemCode")} label="SKU">
          <input
            aria-invalid={showFieldError("itemCode") ? true : undefined}
            className={showFieldError("itemCode") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("itemCode", event.target.value)}
            required
            value={form.itemCode}
          />
        </FormField>
        <FormField error={showFieldError("itemName")} label="Nombre">
          <input
            aria-invalid={showFieldError("itemName") ? true : undefined}
            className={showFieldError("itemName") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("itemName", event.target.value)}
            required
            value={form.itemName}
          />
        </FormField>
        <FormField error={showFieldError("unidadMedida")} label="Unidad">
          <input
            aria-invalid={showFieldError("unidadMedida") ? true : undefined}
            className={showFieldError("unidadMedida") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("unidadMedida", event.target.value)}
            value={form.unidadMedida}
          />
        </FormField>
        <FormField error={showFieldError("descripcion")} label="Descripcion">
          <input
            aria-invalid={showFieldError("descripcion") ? true : undefined}
            className={showFieldError("descripcion") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("descripcion", event.target.value)}
            value={form.descripcion}
          />
        </FormField>
        <FormField error={showFieldError("grupoId")} label="Grupo">
          <select
            aria-invalid={showFieldError("grupoId") ? true : undefined}
            className={showFieldError("grupoId") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("grupoId", Number(event.target.value))}
            value={String(form.grupoId)}
          >
            {grupoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField error={showFieldError("impuestoId")} label="Impuesto">
          <select
            aria-invalid={showFieldError("impuestoId") ? true : undefined}
            className={showFieldError("impuestoId") ? "field-invalid" : undefined}
            onChange={(event) => onFieldChange("impuestoId", Number(event.target.value))}
            value={String(form.impuestoId)}
          >
            {impuestoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField error={showFieldError("costoEstandar")} label="Costo estandar">
          <input
            aria-invalid={showFieldError("costoEstandar") ? true : undefined}
            className={showFieldError("costoEstandar") ? "field-invalid" : undefined}
            min="0"
            onChange={(event) => onFieldChange("costoEstandar", event.target.value)}
            required
            step="0.01"
            type="number"
            value={form.costoEstandar}
          />
        </FormField>

        {errorMessage ? <p className="auth-feedback auth-feedback--error">{errorMessage}</p> : null}

        <FormActions
          idlePrimaryLabel={mode === "edit" ? "Actualizar articulo" : "Crear articulo"}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          submittingPrimaryLabel="Guardando..."
        />
      </form>
    </EditorPanel>
  );
}
