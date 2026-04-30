import { useMemo, useState } from "react";

import { ArticleEditor } from "../components/Articles/ArticleEditor";
import { Badge } from "../components/Common/Badge";
import { CrudToolbar } from "../components/Common/CrudToolbar";
import { DataTable } from "../components/Common/DataTable";
import type { Article } from "../types";
import type { CrearArticuloDto, GrupoArticuloApi, ImpuestoApi } from "../types/api";
import {
  hasValidationErrors,
  isValidEntityCode,
  isValidUnitCode,
  parseNumberInput,
} from "../utils/validation";

type ArticulosScreenProps = {
  articulos: Article[];
  grupos: GrupoArticuloApi[];
  impuestos: ImpuestoApi[];
  canManage: boolean;
  onCreate: (payload: CrearArticuloDto) => Promise<void>;
  onUpdate: (articuloId: string, payload: CrearArticuloDto) => Promise<void>;
  onDelete: (articuloId: string) => Promise<void>;
};

type EditorMode = "create" | "edit";

export type ArticleFormState = {
  itemCode: string;
  itemName: string;
  descripcion: string;
  unidadMedida: string;
  costoEstandar: string;
  grupoId: number;
  impuestoId: number;
};

export type ArticleField = keyof ArticleFormState;
type ArticleFieldErrors = Partial<Record<ArticleField, string>>;

const FORM_VALIDATION_MESSAGE = "Corrige los campos marcados para continuar.";

const defaultGrupoId = (grupos: GrupoArticuloApi[]): number => grupos[0]?.id ?? 1;
const defaultImpuestoId = (impuestos: ImpuestoApi[]): number => impuestos[0]?.id ?? 1;

const buildEmptyArticleForm = (
  grupos: GrupoArticuloApi[],
  impuestos: ImpuestoApi[],
): ArticleFormState => ({
  itemCode: "",
  itemName: "",
  descripcion: "",
  unidadMedida: "UNI",
  costoEstandar: "0",
  grupoId: defaultGrupoId(grupos),
  impuestoId: defaultImpuestoId(impuestos),
});

const buildArticleFormFromArticle = (article: Article): ArticleFormState => ({
  itemCode: article.itemCode,
  itemName: article.itemName,
  descripcion: article.descripcion === "-" ? "" : article.descripcion,
  unidadMedida: article.unidad,
  costoEstandar: String(article.costo),
  grupoId: article.grupoId,
  impuestoId: article.impuestoId,
});

const validateArticleForm = (
  form: ArticleFormState,
  grupos: GrupoArticuloApi[],
  impuestos: ImpuestoApi[],
): ArticleFieldErrors => {
  const errors: ArticleFieldErrors = {};

  if (!form.itemCode.trim()) {
    errors.itemCode = "Ingresa el SKU.";
  } else if (!isValidEntityCode(form.itemCode, 30)) {
    errors.itemCode = "Usa 2-30 caracteres: letras, numeros, punto, guion, / o _.";
  }

  if (!form.itemName.trim()) {
    errors.itemName = "Ingresa el nombre del articulo.";
  } else if (form.itemName.trim().length < 3) {
    errors.itemName = "Ingresa al menos 3 caracteres.";
  } else if (form.itemName.trim().length > 120) {
    errors.itemName = "No excedas 120 caracteres.";
  }

  if (form.descripcion.trim().length > 180) {
    errors.descripcion = "No excedas 180 caracteres.";
  }

  if (!form.unidadMedida.trim()) {
    errors.unidadMedida = "Ingresa la unidad de medida.";
  } else if (!isValidUnitCode(form.unidadMedida)) {
    errors.unidadMedida = "Usa 2-10 letras, por ejemplo UNI o CJ.";
  }

  const costoEstandar = parseNumberInput(form.costoEstandar);
  if (costoEstandar === null || costoEstandar < 0) {
    errors.costoEstandar = "Ingresa un costo valido mayor o igual a 0.";
  }

  if (!grupos.some((grupo) => grupo.id === form.grupoId)) {
    errors.grupoId = "Selecciona un grupo valido.";
  }

  if (!impuestos.some((impuesto) => impuesto.id === form.impuestoId)) {
    errors.impuestoId = "Selecciona un impuesto valido.";
  }

  return errors;
};

export function ArticulosScreen({
  articulos,
  grupos,
  impuestos,
  canManage,
  onCreate,
  onUpdate,
  onDelete,
}: ArticulosScreenProps) {
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);
  const [editingArticuloId, setEditingArticuloId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationActive, setValidationActive] = useState(false);
  const [form, setForm] = useState<ArticleFormState>(() => buildEmptyArticleForm(grupos, impuestos));

  const fieldErrors = useMemo(
    () => validateArticleForm(form, grupos, impuestos),
    [form, grupos, impuestos],
  );

  const grupoOptions = useMemo(
    () => grupos.map((grupo) => ({ value: grupo.id, label: `${grupo.codigo} - ${grupo.nombre}` })),
    [grupos],
  );

  const impuestoOptions = useMemo(
    () =>
      impuestos.map((impuesto) => ({
        value: impuesto.id,
        label: `${impuesto.taxCode} - ${impuesto.nombre}`,
      })),
    [impuestos],
  );

  const filteredArticles = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) {
      return articulos;
    }

    return articulos.filter((article) =>
      [article.itemCode, article.itemName, article.descripcion, article.grupo, article.impuesto]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [articulos, searchTerm]);

  const updateFormField = <K extends keyof ArticleFormState>(
    field: K,
    value: ArticleFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errorMessage === FORM_VALIDATION_MESSAGE) {
      setErrorMessage(null);
    }
  };

  const resetForm = () => {
    setForm(buildEmptyArticleForm(grupos, impuestos));
    setEditingArticuloId(null);
    setEditorMode(null);
    setValidationActive(false);
    setErrorMessage(null);
  };

  const startCreate = () => {
    resetForm();
    setEditorMode("create");
  };

  const startEdit = (article: Article) => {
    setForm(buildArticleFormFromArticle(article));
    setEditingArticuloId(article.id);
    setEditorMode("edit");
    setValidationActive(false);
    setErrorMessage(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationActive(true);
    setErrorMessage(null);

    const nextFieldErrors = validateArticleForm(form, grupos, impuestos);

    if (hasValidationErrors(nextFieldErrors)) {
      setErrorMessage(FORM_VALIDATION_MESSAGE);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CrearArticuloDto = {
        itemCode: form.itemCode.trim(),
        itemName: form.itemName.trim(),
        descripcion: form.descripcion.trim() || undefined,
        unidadMedida: form.unidadMedida.trim().toUpperCase(),
        costoEstandar: parseNumberInput(form.costoEstandar) ?? 0,
        grupoId: form.grupoId,
        impuestoId: form.impuestoId,
      };

      if (editorMode === "edit" && editingArticuloId) {
        await onUpdate(editingArticuloId, payload);
      } else {
        await onCreate(payload);
      }

      resetForm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el articulo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeArticulo = async (article: Article) => {
    if (!window.confirm(`Eliminar el articulo ${article.itemCode} - ${article.itemName}?`)) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onDelete(article.id);
      if (editingArticuloId === article.id) {
        resetForm();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar el articulo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showFieldError = (field: ArticleField): string | undefined =>
    validationActive ? fieldErrors[field] : undefined;

  return (
    <div className="stack">
      <DataTable
        title="Articulos"
        description="Catalogo base, costos, grupos e impuestos conectados al maestro ERP."
        headers={["SKU", "Nombre", "Clasificacion", "Costo", "Estado", "Acciones"]}
        actions={
          <CrudToolbar
            createActionLabel={canManage ? "Nuevo articulo" : undefined}
            onCreateAction={canManage ? startCreate : undefined}
            onSearchChange={setSearchTerm}
            searchPlaceholder="SKU, nombre, grupo, impuesto..."
            searchValue={searchTerm}
          />
        }
        emptyMessage="No hay articulos que coincidan con la busqueda."
        rows={filteredArticles.map((article) => [
          <strong key={`${article.id}-sku`}>{article.itemCode}</strong>,
          <div key={`${article.id}-name`}>
            <strong>{article.itemName}</strong>
            <p className="muted-text">{article.descripcion}</p>
          </div>,
          <div key={`${article.id}-class`}>
            <strong>{article.grupo}</strong>
            <p className="muted-text">{article.impuesto}</p>
          </div>,
          `Bs ${article.costo.toFixed(2)} / ${article.unidad}`,
          <Badge key={`${article.id}-status`} tone={article.activo ? "success" : "neutral"}>
            {article.activo ? "Activo" : "Inactivo"}
          </Badge>,
          canManage ? (
            <div className="action-row" key={`${article.id}-actions`}>
              <button
                className="link-button"
                disabled={isSubmitting}
                onClick={() => startEdit(article)}
                type="button"
              >
                Editar
              </button>
              <button
                className="link-button link-button--danger"
                disabled={isSubmitting}
                onClick={() => {
                  void removeArticulo(article);
                }}
                type="button"
              >
                Eliminar
              </button>
            </div>
          ) : (
            <span key={`${article.id}-readonly`} className="muted-text">
              Solo lectura
            </span>
          ),
        ])}
      />

      {canManage && editorMode ? (
        <ArticleEditor
          errorMessage={errorMessage}
          form={form}
          grupoOptions={grupoOptions}
          impuestoOptions={impuestoOptions}
          isSubmitting={isSubmitting}
          mode={editorMode}
          onCancel={resetForm}
          onFieldChange={updateFormField}
          onSubmit={submit}
          showFieldError={showFieldError}
        />
      ) : errorMessage ? (
        <section className="panel">
          <p className="auth-feedback auth-feedback--error">{errorMessage}</p>
        </section>
      ) : null}
    </div>
  );
}
