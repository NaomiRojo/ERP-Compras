import type { FormEvent } from "react";

import type { ReceiptField, ReceiptFormState } from "../../screens/Ordenes";
import { EditorPanel } from "../Common/EditorPanel";
import { FormActions } from "../Common/FormActions";
import { FormField } from "../Common/FormField";

type ReceiptEditorProps = {
  currencyCode: string;
  errorMessage: string | null;
  form: ReceiptFormState;
  isSubmitting: boolean;
  orderDocNum: string;
  onCancel: () => void;
  onCommentsChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onLineQuantityChange: (lineNum: number, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  resolveWarehouseName: (warehouseId: string) => string;
  showFieldError: (field: ReceiptField) => string | undefined;
  showLineError: (lineNum: number) => string | undefined;
  formatAmount: (currency: string, amount: number) => string;
};

export function ReceiptEditor({
  currencyCode,
  errorMessage,
  form,
  isSubmitting,
  orderDocNum,
  onCancel,
  onCommentsChange,
  onDateChange,
  onLineQuantityChange,
  onSubmit,
  resolveWarehouseName,
  showFieldError,
  showLineError,
  formatAmount,
}: ReceiptEditorProps) {
  return (
    <EditorPanel
      description="Solo se recepcionan lineas pendientes; el stock se actualiza desde backend."
      title={`Registrar recepcion de OC-${orderDocNum}`}
    >
      <form className="stack" noValidate onSubmit={onSubmit}>
        <div className="inline-form inline-form--three">
          <FormField error={showFieldError("fechaDocumento")} label="Fecha recepcion">
            <input
              aria-invalid={showFieldError("fechaDocumento") ? true : undefined}
              className={showFieldError("fechaDocumento") ? "field-invalid" : undefined}
              onChange={(event) => onDateChange(event.target.value)}
              required
              type="date"
              value={form.fechaDocumento}
            />
          </FormField>
          <FormField
            className="field-block field-block--span-two"
            error={showFieldError("comentarios")}
            label="Comentarios"
          >
            <input
              aria-invalid={showFieldError("comentarios") ? true : undefined}
              className={showFieldError("comentarios") ? "field-invalid" : undefined}
              onChange={(event) => onCommentsChange(event.target.value)}
              value={form.comentarios}
            />
          </FormField>
        </div>

        {showFieldError("detalles") ? (
          <p className="field-error">{showFieldError("detalles")}</p>
        ) : null}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Linea</th>
                <th>Articulo</th>
                <th>Almacen</th>
                <th>Pendiente</th>
                <th>A recibir</th>
                <th>Costo</th>
              </tr>
            </thead>
            <tbody>
              {form.detalles.map((line) => (
                <tr key={line.lineNum}>
                  <td>{line.lineNum}</td>
                  <td>
                    <strong>{line.sku}</strong>
                    <p className="muted-text">{line.descripcion}</p>
                  </td>
                  <td>{resolveWarehouseName(line.almacen)}</td>
                  <td>{line.cantidadPendiente}</td>
                  <td>
                    <div className="table-field">
                      <input
                        aria-label={`Cantidad a recibir linea ${line.lineNum}`}
                        aria-invalid={showLineError(line.lineNum) ? true : undefined}
                        className={`table-input${showLineError(line.lineNum) ? " field-invalid" : ""}`}
                        max={line.cantidadPendiente}
                        min="0"
                        onChange={(event) =>
                          onLineQuantityChange(line.lineNum, event.target.value)
                        }
                        step="0.0001"
                        type="number"
                        value={line.cantidadRecibida}
                      />
                      {showLineError(line.lineNum) ? (
                        <p className="field-error">{showLineError(line.lineNum)}</p>
                      ) : null}
                    </div>
                  </td>
                  <td>{formatAmount(currencyCode, line.precioUnitario)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {errorMessage ? <p className="auth-feedback auth-feedback--error">{errorMessage}</p> : null}

        <FormActions
          idlePrimaryLabel="Confirmar recepcion"
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          submittingPrimaryLabel="Registrando..."
        />
      </form>
    </EditorPanel>
  );
}
