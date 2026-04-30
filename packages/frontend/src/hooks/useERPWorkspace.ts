import { useCallback, useEffect, useMemo, useState } from "react";

import {
  erpService,
  type ERPService,
} from "../api/erp";
import { mapERPApiDataToAppData, mapERPApiDataToDashboardMetrics, roleCodeFromUsuario } from "../mappers/erp";
import { ROLE_VIEW_ACCESS, getNavItemsForViews } from "../router/views";
import type { AppData, Metric, NavItem, UserRole, ViewKey } from "../types";
import type {
  CrearArticuloDto,
  CrearCuentaPorPagarDto,
  CrearOrdenCompraDto,
  CrearProveedorDto,
  ERPApiData,
  GrupoArticuloApi,
  ImpuestoApi,
  MonedaApi,
  RegistrarRecepcionOrdenCompraDto,
  RegistrarPagoProveedorDto,
  RolCatalogoApi,
  UsuarioApi,
} from "../types/api";
import { resolveErrorMessage } from "../utils/errors";

type UseERPWorkspaceOptions = {
  currentUser: UsuarioApi | null;
  executeWithAuth: <T>(operation: () => Promise<T>) => Promise<T>;
  service?: ERPService;
};

type SelectOption = {
  id: string;
  label: string;
};

type FacturaOrdenOption = SelectOption & {
  proveedorId: string;
};

export type UseERPWorkspaceResult = {
  appData: AppData | null;
  availableNavItems: NavItem[];
  availableViews: ViewKey[];
  canApproveOrders: boolean;
  canManageFinancial: boolean;
  canManageMasters: boolean;
  canManageOrders: boolean;
  canReceiveOrders: boolean;
  cuentasPagoOptions: SelectOption[];
  currentRoleLabel: string;
  dataErrorMessage: string | null;
  dataLoading: boolean;
  dashboardMetrics: Metric[];
  erpData: ERPApiData | null;
  gruposCatalogo: GrupoArticuloApi[];
  impuestosCatalogo: ImpuestoApi[];
  monedasCatalogo: MonedaApi[];
  onApproveOrdenCompra: (ordenId: string) => Promise<void>;
  onCreateOrdenCompra: (payload: CrearOrdenCompraDto) => Promise<void>;
  onDeleteArticulo: (articuloId: string) => Promise<void>;
  onDeleteOrdenCompra: (ordenId: string) => Promise<void>;
  onDeleteProveedor: (proveedorId: string) => Promise<void>;
  onRegisterArticulo: (payload: CrearArticuloDto) => Promise<void>;
  onRegisterCuentaPorPagar: (payload: CrearCuentaPorPagarDto) => Promise<void>;
  onRegisterPago: (cuentaPorPagarId: string, payload: RegistrarPagoProveedorDto) => Promise<void>;
  onRegisterProveedor: (payload: CrearProveedorDto) => Promise<void>;
  onRegisterRecepcionOrdenCompra: (
    ordenId: string,
    payload: RegistrarRecepcionOrdenCompraDto,
  ) => Promise<void>;
  onUpdateArticulo: (articuloId: string, payload: CrearArticuloDto) => Promise<void>;
  onUpdateOrdenCompra: (ordenId: string, payload: CrearOrdenCompraDto) => Promise<void>;
  onUpdateProveedor: (proveedorId: string, payload: CrearProveedorDto) => Promise<void>;
  ordenesFacturaOptions: FacturaOrdenOption[];
  reloadData: () => void;
  statusChip: string;
};

const ROLE_LABEL_BY_CODE: Record<UserRole, string> = {
  ADMIN: "Administrador",
  COMPRAS: "Compras",
  ALMACEN: "Almacen",
  SUPERVISOR: "Supervisor",
};

export function useERPWorkspace({
  currentUser,
  executeWithAuth,
  service = erpService,
}: UseERPWorkspaceOptions): UseERPWorkspaceResult {
  const [catalogRoles, setCatalogRoles] = useState<RolCatalogoApi[]>([]);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [erpData, setErpData] = useState<ERPApiData | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<Metric[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataErrorMessage, setDataErrorMessage] = useState<string | null>(null);

  const resetWorkspace = useCallback(() => {
    setCatalogRoles([]);
    setAppData(null);
    setErpData(null);
    setDashboardMetrics([]);
    setDataLoading(false);
    setDataErrorMessage(null);
  }, []);

  const assignERPData = useCallback((erpApiData: ERPApiData) => {
    setErpData(erpApiData);
    setCatalogRoles(erpApiData.catalogos.roles);
    setAppData(mapERPApiDataToAppData(erpApiData));
    setDashboardMetrics(mapERPApiDataToDashboardMetrics(erpApiData));
  }, []);

  const loadData = useCallback(async (): Promise<void> => {
    if (!currentUser) {
      resetWorkspace();
      return;
    }

    setDataLoading(true);
    setDataErrorMessage(null);

    try {
      const erpApiData = await executeWithAuth(() =>
        service.fetchERPData({ roleId: currentUser.rolId }),
      );
      assignERPData(erpApiData);
    } catch (error) {
      setDataErrorMessage(resolveErrorMessage(error));
    } finally {
      setDataLoading(false);
    }
  }, [assignERPData, currentUser, executeWithAuth, resetWorkspace, service]);

  useEffect(() => {
    if (!currentUser) {
      resetWorkspace();
      return;
    }

    void loadData();
  }, [currentUser, loadData, resetWorkspace]);

  const reloadData = useCallback(() => {
    void loadData();
  }, [loadData]);

  const runMutation = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<void> => {
      if (!currentUser) {
        throw new Error("Usuario no disponible");
      }

      await executeWithAuth(operation);
      await loadData();
    },
    [currentUser, executeWithAuth, loadData],
  );

  const onRegisterProveedor = useCallback(
    async (payload: CrearProveedorDto): Promise<void> => {
      await runMutation(() => service.createProveedor(payload));
    },
    [runMutation, service],
  );

  const onUpdateProveedor = useCallback(
    async (proveedorId: string, payload: CrearProveedorDto): Promise<void> => {
      await runMutation(() => service.updateProveedor(proveedorId, payload));
    },
    [runMutation, service],
  );

  const onDeleteProveedor = useCallback(
    async (proveedorId: string): Promise<void> => {
      await runMutation(() => service.deleteProveedor(proveedorId));
    },
    [runMutation, service],
  );

  const onRegisterArticulo = useCallback(
    async (payload: CrearArticuloDto): Promise<void> => {
      await runMutation(() => service.createArticulo(payload));
    },
    [runMutation, service],
  );

  const onUpdateArticulo = useCallback(
    async (articuloId: string, payload: CrearArticuloDto): Promise<void> => {
      await runMutation(() => service.updateArticulo(articuloId, payload));
    },
    [runMutation, service],
  );

  const onDeleteArticulo = useCallback(
    async (articuloId: string): Promise<void> => {
      await runMutation(() => service.deleteArticulo(articuloId));
    },
    [runMutation, service],
  );

  const onCreateOrdenCompra = useCallback(
    async (payload: CrearOrdenCompraDto): Promise<void> => {
      await runMutation(() => service.createOrdenCompra(payload));
    },
    [runMutation, service],
  );

  const onUpdateOrdenCompra = useCallback(
    async (ordenId: string, payload: CrearOrdenCompraDto): Promise<void> => {
      await runMutation(() => service.updateOrdenCompra(ordenId, payload));
    },
    [runMutation, service],
  );

  const onDeleteOrdenCompra = useCallback(
    async (ordenId: string): Promise<void> => {
      await runMutation(() => service.deleteOrdenCompra(ordenId));
    },
    [runMutation, service],
  );

  const onApproveOrdenCompra = useCallback(
    async (ordenId: string): Promise<void> => {
      await runMutation(() => service.approveOrdenCompra(ordenId));
    },
    [runMutation, service],
  );

  const onRegisterRecepcionOrdenCompra = useCallback(
    async (ordenId: string, payload: RegistrarRecepcionOrdenCompraDto): Promise<void> => {
      await runMutation(() => service.registerRecepcionOrdenCompra(ordenId, payload));
    },
    [runMutation, service],
  );

  const onRegisterCuentaPorPagar = useCallback(
    async (payload: CrearCuentaPorPagarDto): Promise<void> => {
      await runMutation(() => service.createCuentaPorPagar(payload));
    },
    [runMutation, service],
  );

  const onRegisterPago = useCallback(
    async (
      cuentaPorPagarId: string,
      payload: RegistrarPagoProveedorDto,
    ): Promise<void> => {
      await runMutation(() => service.registrarPagoCuentaPorPagar(cuentaPorPagarId, payload));
    },
    [runMutation, service],
  );

  const currentRoleCode = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return roleCodeFromUsuario(currentUser, catalogRoles);
  }, [catalogRoles, currentUser]);

  const canManageMasters = useMemo(
    () => currentRoleCode === "ADMIN" || currentRoleCode === "COMPRAS",
    [currentRoleCode],
  );

  const canApproveOrders = useMemo(
    () => currentRoleCode === "ADMIN" || currentRoleCode === "SUPERVISOR",
    [currentRoleCode],
  );

  const canReceiveOrders = useMemo(
    () => currentRoleCode === "ADMIN" || currentRoleCode === "ALMACEN",
    [currentRoleCode],
  );

  const monedasCatalogo = useMemo(
    () => erpData?.catalogos.monedas ?? [],
    [erpData],
  );

  const gruposCatalogo = useMemo(
    () => erpData?.catalogos.gruposArticulo ?? [],
    [erpData],
  );

  const impuestosCatalogo = useMemo(
    () => erpData?.catalogos.impuestos ?? [],
    [erpData],
  );

  const ordenesFacturaOptions = useMemo(() => {
    if (!erpData || !appData) {
      return [];
    }

    const providerById = new Map(
      appData.proveedores.map((proveedor) => [proveedor.id, proveedor.cardName]),
    );

    return erpData.ordenes
      .filter((orden) => orden.tipoDocId === 2 && orden.estadoId !== 1)
      .map((orden) => ({
        id: orden.id,
        proveedorId: orden.proveedorId,
        label: `OC-${orden.docNum} | ${providerById.get(orden.proveedorId) ?? orden.proveedorId}`,
      }));
  }, [appData, erpData]);

  const cuentasPagoOptions = useMemo(() => {
    if (!appData) {
      return [];
    }

    return appData.cxp
      .filter((cuenta) => cuenta.saldo > 0)
      .map((cuenta) => ({
        id: cuenta.id,
        label: `${cuenta.factura} | ${cuenta.proveedor} | Saldo ${cuenta.saldo.toLocaleString()}`,
      }));
  }, [appData]);

  const availableViews = useMemo(
    () => (currentRoleCode ? ROLE_VIEW_ACCESS[currentRoleCode] : []),
    [currentRoleCode],
  );

  const availableNavItems = useMemo(
    () => getNavItemsForViews(availableViews),
    [availableViews],
  );

  const currentRoleLabel = useMemo(() => {
    if (!currentRoleCode) {
      return "Sin rol";
    }

    return (
      catalogRoles.find((role) => role.codigo === currentRoleCode)?.nombre ??
      ROLE_LABEL_BY_CODE[currentRoleCode]
    );
  }, [catalogRoles, currentRoleCode]);

  const statusChip = useMemo(() => {
    if (dataLoading) {
      return "Sincronizando datos...";
    }

    if (dataErrorMessage) {
      return "Error al sincronizar";
    }

    return "Conectado a backend";
  }, [dataErrorMessage, dataLoading]);

  return {
    appData,
    availableNavItems,
    availableViews,
    canApproveOrders,
    canManageFinancial: canManageMasters,
    canManageMasters,
    canManageOrders: canManageMasters,
    canReceiveOrders,
    cuentasPagoOptions,
    currentRoleLabel,
    dashboardMetrics,
    dataErrorMessage,
    dataLoading,
    erpData,
    gruposCatalogo,
    impuestosCatalogo,
    monedasCatalogo,
    onApproveOrdenCompra,
    onCreateOrdenCompra,
    onDeleteArticulo,
    onDeleteOrdenCompra,
    onDeleteProveedor,
    onRegisterArticulo,
    onRegisterCuentaPorPagar,
    onRegisterPago,
    onRegisterProveedor,
    onRegisterRecepcionOrdenCompra,
    onUpdateArticulo,
    onUpdateOrdenCompra,
    onUpdateProveedor,
    ordenesFacturaOptions,
    reloadData,
    statusChip,
  };
}
