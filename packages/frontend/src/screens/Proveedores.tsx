import { useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Drawer, IconButton } from "@mui/material";

import { Badge } from "../components/Common/Badge";
import { CrudToolbar } from "../components/Common/CrudToolbar";
import { DataTable } from "../components/Common/DataTable";
import { PermissionGate } from "../components/Common/PermissionGate";
import { ProviderEditor } from "../components/Providers/ProviderEditor";
import type { Provider } from "../types";
import type { CrearProveedorDto, MonedaApi } from "../types/api";
import {
  hasValidationErrors,
  isValidEmail,
  isValidEntityCode,
  isValidNitRut,
  isValidPhone,
  parseNumberInput,
} from "../utils/validation";

type ProveedoresScreenProps = {
  proveedores: Provider[];
  monedas: MonedaApi[];
  canManage: boolean;
  onCreate: (payload: CrearProveedorDto) => Promise<void>;
  onUpdate: (proveedorId: string, payload: CrearProveedorDto) => Promise<void>;
  onDelete: (proveedorId: string) => Promise<void>;
};

type EditorMode = "create" | "edit";

export type ProviderFormState = {
  cardCode: string;
  cardName: string;
  nombreComercial: string;
  nitRut: string;
  email: string;
  telefono: string;
  direccion: string;
  lineaCredito: string;
  monedaId: number;
};

export type ProviderField = keyof ProviderFormState;
type ProviderFieldErrors = Partial<Record<ProviderField, string>>;

const FORM_VALIDATION_MESSAGE = "Corrige los campos marcados para continuar.";

const defaultMonedaId = (monedas: MonedaApi[]): number => monedas[0]?.id ?? 1;

const buildEmptyProviderForm = (monedas: MonedaApi[]): ProviderFormState => ({
  cardCode: "",
  cardName: "",
  nombreComercial: "",
  nitRut: "",
  email: "",
  telefono: "",
  direccion: "",
  lineaCredito: "0",
  monedaId: defaultMonedaId(monedas),
});

const buildProviderFormFromProvider = (provider: Provider): ProviderFormState => ({
  cardCode: provider.cardCode,
  cardName: provider.cardName,
  nombreComercial: provider.nombreComercial === "-" ? "" : provider.nombreComercial,
  nitRut: provider.nitRut,
  email: provider.email === "-" ? "" : provider.email,
  telefono: provider.telefono === "-" ? "" : provider.telefono,
  direccion: provider.direccion === "-" ? "" : provider.direccion,
  lineaCredito: String(provider.lineaCredito),
  monedaId: provider.monedaId,
});

const validateProviderForm = (
  form: ProviderFormState,
  monedas: MonedaApi[],
): ProviderFieldErrors => {
  const errors: ProviderFieldErrors = {};

  if (!form.cardCode.trim()) {
    errors.cardCode = "Ingresa el codigo del proveedor.";
  } else if (!isValidEntityCode(form.cardCode, 20)) {
    errors.cardCode = "Usa 2-20 caracteres: letras, numeros, punto, guion, / o _.";
  }

  if (!form.cardName.trim()) {
    errors.cardName = "Ingresa el nombre legal.";
  } else if (form.cardName.trim().length < 3) {
    errors.cardName = "Ingresa al menos 3 caracteres.";
  } else if (form.cardName.trim().length > 120) {
    errors.cardName = "No excedas 120 caracteres.";
  }

  if (form.nombreComercial.trim().length > 120) {
    errors.nombreComercial = "No excedas 120 caracteres.";
  }

  if (!form.nitRut.trim()) {
    errors.nitRut = "Ingresa el NIT o RUT.";
  } else if (!isValidNitRut(form.nitRut)) {
    errors.nitRut = "Usa 5-20 caracteres alfanumericos o guiones.";
  }

  if (form.email.trim() && !isValidEmail(form.email)) {
    errors.email = "Ingresa un correo valido.";
  }

  if (form.telefono.trim() && !isValidPhone(form.telefono)) {
    errors.telefono = "Ingresa un telefono valido con 7 a 15 digitos.";
  }

  if (form.direccion.trim().length > 160) {
    errors.direccion = "No excedas 160 caracteres.";
  }

  const lineaCredito = parseNumberInput(form.lineaCredito);
  if (lineaCredito === null || lineaCredito < 0) {
    errors.lineaCredito = "Ingresa un monto valido mayor o igual a 0.";
  }

  if (!monedas.some((moneda) => moneda.id === form.monedaId)) {
    errors.monedaId = "Selecciona una moneda valida.";
  }

  return errors;
};

export function ProveedoresScreen({
  proveedores,
  monedas,
  canManage,
  onCreate,
  onUpdate,
  onDelete,
}: ProveedoresScreenProps) {
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationActive, setValidationActive] = useState(false);
  const [form, setForm] = useState<ProviderFormState>(() => buildEmptyProviderForm(monedas));

  const fieldErrors = useMemo(() => validateProviderForm(form, monedas), [form, monedas]);

  const monedaOptions = useMemo(
    () =>
      monedas.map((moneda) => ({
        value: moneda.id,
        label: `${moneda.codigo} - ${moneda.nombre}`,
      })),
    [monedas],
  );

  const filteredProviders = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) {
      return proveedores;
    }

    return proveedores.filter((provider) =>
      [
        provider.cardCode,
        provider.cardName,
        provider.nombreComercial,
        provider.nitRut,
        provider.email,
        provider.telefono,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [proveedores, searchTerm]);

  const updateFormField = <K extends keyof ProviderFormState>(
    field: K,
    value: ProviderFormState[K],
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
    setForm(buildEmptyProviderForm(monedas));
    setEditingProviderId(null);
    setEditorMode(null);
    setValidationActive(false);
    setErrorMessage(null);
  };

  const startCreate = () => {
    resetForm();
    setEditorMode("create");
  };

  const startEdit = (provider: Provider) => {
    setForm(buildProviderFormFromProvider(provider));
    setEditingProviderId(provider.id);
    setEditorMode("edit");
    setValidationActive(false);
    setErrorMessage(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationActive(true);
    setErrorMessage(null);

    const nextFieldErrors = validateProviderForm(form, monedas);

    if (hasValidationErrors(nextFieldErrors)) {
      setErrorMessage(FORM_VALIDATION_MESSAGE);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CrearProveedorDto = {
        cardCode: form.cardCode.trim(),
        cardName: form.cardName.trim(),
        nombreComercial: form.nombreComercial.trim() || undefined,
        nitRut: form.nitRut.trim(),
        monedaId: form.monedaId,
        email: form.email.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        lineaCredito: parseNumberInput(form.lineaCredito) ?? 0,
      };

      if (editorMode === "edit" && editingProviderId) {
        await onUpdate(editingProviderId, payload);
      } else {
        await onCreate(payload);
      }

      resetForm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el proveedor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeProvider = async (provider: Provider) => {
    if (!window.confirm(`Eliminar el proveedor ${provider.cardCode} - ${provider.cardName}?`)) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onDelete(provider.id);
      if (editingProviderId === provider.id) {
        resetForm();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar el proveedor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showFieldError = (field: ProviderField): string | undefined =>
    validationActive ? fieldErrors[field] : undefined;
  const editorOpen = canManage && editorMode !== null;

  return (
    <div className="stack">
      <DataTable
        title="Proveedores"
        description="Directorio maestro con datos comerciales y control del maestro activo."
        headers={["Codigo", "Nombre", "Contacto", "Moneda", "Balance", "Estado", "Acciones"]}
        actions={
          <CrudToolbar
            createActionDisabledReason="Tu rol no tiene permiso para crear proveedores."
            createActionLabel="Nuevo proveedor"
            onCreateAction={canManage ? startCreate : undefined}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Codigo, nombre, NIT, email..."
            searchValue={searchTerm}
          />
        }
        emptyMessage="No hay proveedores que coincidan con la busqueda."
        rows={filteredProviders.map((provider) => [
          <div key={`${provider.id}-code`}>
            <strong>{provider.cardCode}</strong>
            <p className="muted-text">{provider.nitRut}</p>
          </div>,
          <div key={`${provider.id}-name`}>
            <strong>{provider.cardName}</strong>
            <p className="muted-text">{provider.nombreComercial}</p>
          </div>,
          <div key={`${provider.id}-contact`}>
            <strong>{provider.email}</strong>
            <p className="muted-text">{provider.telefono}</p>
          </div>,
          provider.moneda,
          `${provider.moneda} ${provider.balance.toLocaleString()}`,
          <Badge key={`${provider.id}-status`} tone={provider.activo ? "success" : "neutral"}>
            {provider.activo ? "Activo" : "Inactivo"}
          </Badge>,
          <div className="action-row" key={`${provider.id}-actions`}>
            <PermissionGate disabled={!canManage} reason="Tu rol no tiene permiso para editar proveedores.">
              <button
                className="link-button"
                disabled={isSubmitting || !canManage}
                onClick={() => startEdit(provider)}
                type="button"
              >
                Editar
              </button>
            </PermissionGate>
            <PermissionGate disabled={!canManage} reason="Tu rol no tiene permiso para eliminar proveedores.">
              <button
                className="link-button link-button--danger"
                disabled={isSubmitting || !canManage}
                onClick={() => {
                  void removeProvider(provider);
                }}
                type="button"
              >
                Eliminar
              </button>
            </PermissionGate>
          </div>,
        ])}
      />

      {errorMessage && !editorOpen ? (
        <section className="panel">
          <p className="auth-feedback auth-feedback--error">{errorMessage}</p>
        </section>
      ) : null}

      <Drawer
        anchor="right"
        className="crud-editor-drawer"
        onClose={resetForm}
        open={editorOpen}
        slotProps={{ paper: { className: "crud-editor-drawer__paper" } }}
        transitionDuration={0}
        variant="persistent"
      >
        <Box className="crud-editor-drawer__close">
          <IconButton aria-label="Cerrar formulario de proveedor" onClick={resetForm} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        {editorMode ? (
          <ProviderEditor
            errorMessage={errorMessage}
            form={form}
            isSubmitting={isSubmitting}
            mode={editorMode}
            monedaOptions={monedaOptions}
            onCancel={resetForm}
            onFieldChange={updateFormField}
            onSubmit={submit}
            showFieldError={showFieldError}
          />
        ) : null}
      </Drawer>
    </div>
  );
}
