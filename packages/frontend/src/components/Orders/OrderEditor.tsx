import type { FormEvent } from "react";

import type { Article, Provider } from "../../types";
import type { AlmacenApi, ImpuestoApi, MonedaApi } from "../../types/api";
import type {
  OrderField,
  OrderFieldErrors,
  OrderFormLineState,
  OrderFormState,
  OrderLineField,
} from "../../screens/Ordenes";
import { EditorPanel } from "../Common/EditorPanel";
import { FormActions } from "../Common/FormActions";
import { FormField } from "../Common/FormField";

type OrderPreview = {
  subtotal: number;
  descuentoTotal: number;
  impuestosTotal: number;
  totalDocumento: number;
};

type OrderEditorProps = {
  almacenes: AlmacenApi[];
  articulos: Article[];
  proveedores: Provider[];
  impuestos: ImpuestoApi[];
  monedas: MonedaApi[];
  currentCurrency: string;
  errorMessage: string | null;
  form: OrderFormState;
  isSubmitting: boolean;
  mode: "create" | "edit";
  orderPreview: OrderPreview;
  onAddLine: () => void;
  onCancel: () => void;
  onFieldChange: <K extends keyof OrderFormState>(field: K, value: OrderFormState[K]) => void;
  onProviderChange: (proveedorId: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSyncArticle: (index: number, articuloId: string) => void;
  onUpdateLine: <K extends keyof OrderFormLineState>(
    index: number,
    field: K,
    value: OrderFormLineState[K],
  ) => void;
  onRemoveLine: (index: number) => void;
  showFieldError: (field: OrderField) => string | undefined;
  showLineError: (index: number, field: OrderLineField) => string | undefined;
  formatAmount: (currency: string, amount: number) => string;
};

export function OrderEditor({
  almacenes,
  articulos,
  proveedores,
  impuestos,
  monedas,
  currentCurrency,
  errorMessage,
  form,
  isSubmitting,
  mode,
  orderPreview,
  onAddLine,
  onCancel,
  onFieldChange,
  onProviderChange,
  onSubmit,
  onSyncArticle,
  onUpdateLine,
  onRemoveLine,
  showFieldError,
  showLineError,
  formatAmount,
}: OrderEditorProps) {
  const title = mode === "edit" ? "Editar orden de compra" : "Nueva orden de compra";

  return (
    <EditorPanel
      description="Genera un borrador operativo con lineas, impuestos y vencimiento."
      title={title}
    >
      <form className="stack" noValidate onSubmit={onSubmit}>
        <div className="inline-form inline-form--four">
          <FormField error={showFieldError("proveedorId")} label="Proveedor">
            <select
              aria-invalid={showFieldError("proveedorId") ? true : undefined}
              className={showFieldError("proveedorId") ? "field-invalid" : undefined}
              onChange={(event) => onProviderChange(event.target.value)}
              required
              value={form.proveedorId}
            >
              {proveedores.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.cardCode} - {provider.cardName}
                </option>
              ))}
            </select>
          </FormField>
          <FormField error={showFieldError("monedaId")} label="Moneda">
            <select
              aria-invalid={showFieldError("monedaId") ? true : undefined}
              className={showFieldError("monedaId") ? "field-invalid" : undefined}
              onChange={(event) => onFieldChange("monedaId", Number(event.target.value))}
              value={String(form.monedaId)}
            >
              {monedas.map((currency) => (
                <option key={currency.id} value={currency.id}>
                  {currency.codigo} - {currency.nombre}
                </option>
              ))}
            </select>
          </FormField>
          <FormField error={showFieldError("fechaDocumento")} label="Fecha documento">
            <input
              aria-invalid={showFieldError("fechaDocumento") ? true : undefined}
              className={showFieldError("fechaDocumento") ? "field-invalid" : undefined}
              onChange={(event) => onFieldChange("fechaDocumento", event.target.value)}
              required
              type="date"
              value={form.fechaDocumento}
            />
          </FormField>
          <FormField error={showFieldError("fechaVencimiento")} label="Fecha vencimiento">
            <input
              aria-invalid={showFieldError("fechaVencimiento") ? true : undefined}
              className={showFieldError("fechaVencimiento") ? "field-invalid" : undefined}
              onChange={(event) => onFieldChange("fechaVencimiento", event.target.value)}
              type="date"
              value={form.fechaVencimiento}
            />
          </FormField>
        </div>

        <FormField
          className="field-block"
          error={showFieldError("comentarios")}
          label="Comentarios"
        >
          <textarea
            aria-invalid={showFieldError("comentarios") ? true : undefined}
            className={`textarea-field${showFieldError("comentarios") ? " field-invalid" : ""}`}
            onChange={(event) => onFieldChange("comentarios", event.target.value)}
            rows={3}
            value={form.comentarios}
          />
        </FormField>

        <div className="panel panel--nested">
          <div className="panel__header">
            <div>
              <h3>Lineas</h3>
              <p>Las lineas se valoran con impuesto y descuento por monto.</p>
            </div>
            <button className="secondary-button" onClick={onAddLine} type="button">
              Agregar linea
            </button>
          </div>

          {showFieldError("detalles") ? (
            <p className="field-error">{showFieldError("detalles")}</p>
          ) : null}

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Articulo</th>
                  <th>Almacen</th>
                  <th>Impuesto</th>
                  <th>Descripcion</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Descuento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {form.detalles.map((line, index) => (
                  <tr key={`${line.articuloId}-${index}`}>
                    <td>
                      <div className="table-field">
                        <select
                          aria-label={`Articulo linea ${index + 1}`}
                          aria-invalid={showLineError(index, "articuloId") ? true : undefined}
                          className={`table-input${showLineError(index, "articuloId") ? " field-invalid" : ""}`}
                          onChange={(event) => onSyncArticle(index, event.target.value)}
                          value={line.articuloId}
                        >
                          {articulos.map((article) => (
                            <option key={article.id} value={article.id}>
                              {article.itemCode} - {article.itemName}
                            </option>
                          ))}
                        </select>
                        {showLineError(index, "articuloId") ? (
                          <p className="field-error">{showLineError(index, "articuloId")}</p>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="table-field">
                        <select
                          aria-label={`Almacen linea ${index + 1}`}
                          aria-invalid={showLineError(index, "almacenId") ? true : undefined}
                          className={`table-input${showLineError(index, "almacenId") ? " field-invalid" : ""}`}
                          onChange={(event) =>
                            onUpdateLine(index, "almacenId", event.target.value)
                          }
                          value={line.almacenId}
                        >
                          {almacenes.map((warehouse) => (
                            <option key={warehouse.id} value={warehouse.id}>
                              {warehouse.nombre}
                            </option>
                          ))}
                        </select>
                        {showLineError(index, "almacenId") ? (
                          <p className="field-error">{showLineError(index, "almacenId")}</p>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="table-field">
                        <select
                          aria-label={`Impuesto linea ${index + 1}`}
                          aria-invalid={showLineError(index, "impuestoId") ? true : undefined}
                          className={`table-input${showLineError(index, "impuestoId") ? " field-invalid" : ""}`}
                          onChange={(event) =>
                            onUpdateLine(index, "impuestoId", Number(event.target.value))
                          }
                          value={String(line.impuestoId)}
                        >
                          {impuestos.map((tax) => (
                            <option key={tax.id} value={tax.id}>
                              {tax.taxCode} ({tax.porcentaje}%)
                            </option>
                          ))}
                        </select>
                        {showLineError(index, "impuestoId") ? (
                          <p className="field-error">{showLineError(index, "impuestoId")}</p>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="table-field">
                        <input
                          aria-label={`Descripcion linea ${index + 1}`}
                          aria-invalid={showLineError(index, "descripcion") ? true : undefined}
                          className={`table-input${showLineError(index, "descripcion") ? " field-invalid" : ""}`}
                          onChange={(event) =>
                            onUpdateLine(index, "descripcion", event.target.value)
                          }
                          value={line.descripcion}
                        />
                        {showLineError(index, "descripcion") ? (
                          <p className="field-error">{showLineError(index, "descripcion")}</p>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="table-field">
                        <input
                          aria-label={`Cantidad linea ${index + 1}`}
                          aria-invalid={showLineError(index, "cantidadTotal") ? true : undefined}
                          className={`table-input${showLineError(index, "cantidadTotal") ? " field-invalid" : ""}`}
                          min="0"
                          onChange={(event) =>
                            onUpdateLine(index, "cantidadTotal", event.target.value)
                          }
                          step="0.0001"
                          type="number"
                          value={line.cantidadTotal}
                        />
                        {showLineError(index, "cantidadTotal") ? (
                          <p className="field-error">{showLineError(index, "cantidadTotal")}</p>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="table-field">
                        <input
                          aria-label={`Precio linea ${index + 1}`}
                          aria-invalid={showLineError(index, "precioUnitario") ? true : undefined}
                          className={`table-input${showLineError(index, "precioUnitario") ? " field-invalid" : ""}`}
                          min="0"
                          onChange={(event) =>
                            onUpdateLine(index, "precioUnitario", event.target.value)
                          }
                          step="0.01"
                          type="number"
                          value={line.precioUnitario}
                        />
                        {showLineError(index, "precioUnitario") ? (
                          <p className="field-error">{showLineError(index, "precioUnitario")}</p>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="table-field">
                        <input
                          aria-label={`Descuento linea ${index + 1}`}
                          aria-invalid={showLineError(index, "descuentoLinea") ? true : undefined}
                          className={`table-input${showLineError(index, "descuentoLinea") ? " field-invalid" : ""}`}
                          min="0"
                          onChange={(event) =>
                            onUpdateLine(index, "descuentoLinea", event.target.value)
                          }
                          step="0.01"
                          type="number"
                          value={line.descuentoLinea}
                        />
                        {showLineError(index, "descuentoLinea") ? (
                          <p className="field-error">{showLineError(index, "descuentoLinea")}</p>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <button
                        className="link-button link-button--danger"
                        onClick={() => onRemoveLine(index)}
                        type="button"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="summary-grid summary-grid--four">
          <div>
            <span>Subtotal</span>
            <strong>{formatAmount(currentCurrency, orderPreview.subtotal)}</strong>
          </div>
          <div>
            <span>Descuento</span>
            <strong>{formatAmount(currentCurrency, orderPreview.descuentoTotal)}</strong>
          </div>
          <div>
            <span>Impuestos</span>
            <strong>{formatAmount(currentCurrency, orderPreview.impuestosTotal)}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{formatAmount(currentCurrency, orderPreview.totalDocumento)}</strong>
          </div>
        </div>

        {errorMessage ? <p className="auth-feedback auth-feedback--error">{errorMessage}</p> : null}

        <FormActions
          idlePrimaryLabel={mode === "edit" ? "Actualizar orden" : "Crear orden"}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          submittingPrimaryLabel="Guardando..."
        />
      </form>
    </EditorPanel>
  );
}
