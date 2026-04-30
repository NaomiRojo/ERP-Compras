import { Navigate } from "react-router-dom";

import type { UseERPWorkspaceResult } from "../../hooks/useERPWorkspace";
import { VIEW_LABELS } from "../../router/views";
import {
  ArticulosScreen,
  AuditoriaScreen,
  CuentasPorPagarScreen,
  DashboardScreen,
  InventarioScreen,
  OrdenesScreen,
  PagosScreen,
  ProveedoresScreen,
  ReportesScreen,
  UsuariosScreen,
} from "../../screens";
import type { ViewKey } from "../../types";
import { ErrorPanel, LoadingPanel } from "../Common/StatePanels";
import { MainLayout } from "../Layout/MainLayout";

type ProtectedAppShellProps = {
  currentUserName: string;
  currentView: ViewKey | null;
  defaultProtectedPath: string;
  isCurrentViewAllowed: boolean;
  onLogout: () => void;
  workspace: UseERPWorkspaceResult;
};

export function ProtectedAppShell({
  currentUserName,
  currentView,
  defaultProtectedPath,
  isCurrentViewAllowed,
  onLogout,
  workspace,
}: ProtectedAppShellProps) {
  if (!isCurrentViewAllowed || currentView === null) {
    return <Navigate replace to={defaultProtectedPath} />;
  }

  const currentSubtitle =
    workspace.availableNavItems.find((item) => item.key === currentView)?.description ??
    "Modulo operativo";

  const renderCurrentView = () => {
    if (!workspace.appData) {
      return null;
    }

    switch (currentView) {
      case "dashboard":
        return (
          <DashboardScreen
            cuentas={workspace.appData.cxp}
            inventario={workspace.appData.inventario}
            metrics={workspace.dashboardMetrics}
            ordenes={workspace.appData.ordenes}
            pagos={workspace.appData.pagos}
          />
        );
      case "usuarios":
        return <UsuariosScreen users={workspace.appData.users} />;
      case "proveedores":
        return (
          <ProveedoresScreen
            canManage={workspace.canManageMasters}
            monedas={workspace.monedasCatalogo}
            onCreate={workspace.onRegisterProveedor}
            onDelete={workspace.onDeleteProveedor}
            onUpdate={workspace.onUpdateProveedor}
            proveedores={workspace.appData.proveedores}
          />
        );
      case "articulos":
        return (
          <ArticulosScreen
            articulos={workspace.appData.articulos}
            canManage={workspace.canManageMasters}
            grupos={workspace.gruposCatalogo}
            impuestos={workspace.impuestosCatalogo}
            onCreate={workspace.onRegisterArticulo}
            onDelete={workspace.onDeleteArticulo}
            onUpdate={workspace.onUpdateArticulo}
          />
        );
      case "ordenes":
        return (
          <OrdenesScreen
            almacenes={workspace.erpData?.catalogos.almacenes ?? []}
            articulos={workspace.appData.articulos}
            canApprove={workspace.canApproveOrders}
            canManage={workspace.canManageOrders}
            canReceive={workspace.canReceiveOrders}
            impuestos={workspace.impuestosCatalogo}
            monedas={workspace.monedasCatalogo}
            onApprove={workspace.onApproveOrdenCompra}
            onCreate={workspace.onCreateOrdenCompra}
            onDelete={workspace.onDeleteOrdenCompra}
            onReceive={workspace.onRegisterRecepcionOrdenCompra}
            onUpdate={workspace.onUpdateOrdenCompra}
            ordenes={workspace.appData.ordenes}
            proveedores={workspace.appData.proveedores}
          />
        );
      case "inventario":
        return (
          <InventarioScreen
            inventario={workspace.appData.inventario}
            movimientos={workspace.appData.movimientos}
          />
        );
      case "cxp":
        return (
          <CuentasPorPagarScreen
            canRegister={workspace.canManageFinancial}
            cuentas={workspace.appData.cxp}
            onRegister={workspace.onRegisterCuentaPorPagar}
            ordenesFactura={workspace.ordenesFacturaOptions}
          />
        );
      case "pagos":
        return (
          <PagosScreen
            canRegister={workspace.canManageFinancial}
            cuentasPago={workspace.cuentasPagoOptions}
            onRegister={workspace.onRegisterPago}
            pagos={workspace.appData.pagos}
          />
        );
      case "reportes":
        return <ReportesScreen data={workspace.appData} />;
      case "auditoria":
        return <AuditoriaScreen auditoria={workspace.appData.auditoria} />;
    }
  };

  return (
    <MainLayout
      currentUserName={currentUserName}
      currentUserRoleLabel={workspace.currentRoleLabel}
      navItems={workspace.availableNavItems}
      onLogout={onLogout}
      statusChip={workspace.statusChip}
      subtitle={currentSubtitle}
      title={VIEW_LABELS[currentView]}
    >
      {workspace.dataErrorMessage ? (
        <ErrorPanel
          message={workspace.dataErrorMessage}
          onRetry={workspace.reloadData}
          title="Error de sincronizacion"
        />
      ) : null}

      {workspace.dataLoading && !workspace.appData ? (
        <LoadingPanel message="Consultando backend ERP..." title="Cargando datos" />
      ) : null}

      {renderCurrentView()}
    </MainLayout>
  );
}
