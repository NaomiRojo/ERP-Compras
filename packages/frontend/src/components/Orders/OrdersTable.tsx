import { resolveTone } from "../../mocks/data";
import type { Order } from "../../types";
import { Badge } from "../Common/Badge";
import { CrudToolbar } from "../Common/CrudToolbar";
import { DataTable, type DataTableFilter } from "../Common/DataTable";
import { PermissionGate } from "../Common/PermissionGate";

type OrdersTableProps = {
  canApprove: boolean;
  canManage: boolean;
  canReceive: boolean;
  createDisabled?: boolean;
  formatAmount: (currency: string, amount: number) => string;
  isSubmitting: boolean;
  onApprove: (order: Order) => void;
  onCreate: () => void;
  onDelete: (order: Order) => void;
  onEdit: (order: Order) => void;
  onOpenDetail: (order: Order) => void;
  onReceive: (order: Order) => void;
  orders: Order[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  isDraftOrder: (order: Order) => boolean;
  isReceivableOrder: (order: Order) => boolean;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
};

export function OrdersTable({
  canApprove,
  canManage,
  canReceive,
  createDisabled = false,
  formatAmount,
  isSubmitting,
  onApprove,
  onCreate,
  onDelete,
  onEdit,
  onOpenDetail,
  onReceive,
  orders,
  searchTerm,
  onSearchTermChange,
  isDraftOrder,
  isReceivableOrder,
  statusFilter,
  onStatusFilterChange,
}: OrdersTableProps) {
  const statusOptions = [
    { label: "Todos", value: "" },
    ...[...new Set(orders.map((order) => order.estado))]
      .sort((a, b) => a.localeCompare(b, "es"))
      .map((status) => ({ label: status, value: status })),
  ];
  const tableFilters: DataTableFilter[] = [
    {
      id: "estado",
      label: "Estado",
      options: statusOptions,
      value: statusFilter,
      onChange: onStatusFilterChange,
    },
  ];

  return (
    <DataTable
      title="Ordenes de compra"
      description="Gestion documental completa: borradores, aprobacion y recepcion."
      headers={["Documento", "Proveedor", "Fecha", "Estado", "Total", "Pendiente", "Acciones"]}
      filters={tableFilters}
      pagination={{ enabled: true, defaultRowsPerPage: 10, rowsPerPageOptions: [5, 10, 25, 50] }}
      sortableColumns={[0, 1, 2, 3, 4, 5]}
      actions={
        <CrudToolbar
          createActionDisabled={createDisabled}
          createActionDisabledReason="Tu rol no tiene permiso para crear ordenes."
          createActionLabel="Nueva orden"
          onCreateAction={canManage ? onCreate : undefined}
          onSearchChange={onSearchTermChange}
          searchPlaceholder="OC, proveedor, estado, SKU..."
          searchValue={searchTerm}
        />
      }
      emptyMessage="No hay ordenes que coincidan con la busqueda."
      rowMeta={orders.map((order) => {
        const pendiente = order.lines.reduce(
          (accumulator, line) => accumulator + line.pendingQty,
          0,
        );

        return {
          id: order.id,
          filterValues: {
            estado: order.estado,
          },
          sortValues: [Number(order.docNum), order.proveedor, order.fecha, order.estado, order.total, pendiente],
        };
      })}
      rows={orders.map((order) => {
        const pendiente = order.lines.reduce(
          (accumulator, line) => accumulator + line.pendingQty,
          0,
        );

        return [
          <strong key={`${order.id}-doc`}>OC-{order.docNum}</strong>,
          order.proveedor,
          order.fecha,
          <Badge key={`${order.id}-estado`} tone={resolveTone(order.estado)}>
            {order.estado}
          </Badge>,
          formatAmount(order.moneda, order.total),
          pendiente.toLocaleString(),
          <div className="action-row" key={`${order.id}-actions`}>
            <button className="link-button" onClick={() => onOpenDetail(order)} type="button">
              Ver
            </button>
            {isDraftOrder(order) ? (
              <PermissionGate disabled={!canManage} reason="Tu rol no tiene permiso para editar ordenes.">
              <button
                className="link-button"
                disabled={!canManage}
                onClick={() => onEdit(order)}
                type="button"
              >
                Editar
              </button>
              </PermissionGate>
            ) : null}
            {isDraftOrder(order) ? (
              <PermissionGate disabled={!canApprove} reason="Tu rol no tiene permiso para aprobar ordenes.">
              <button
                className="link-button"
                disabled={isSubmitting || !canApprove}
                onClick={() => onApprove(order)}
                type="button"
              >
                Aprobar
              </button>
              </PermissionGate>
            ) : null}
            {isReceivableOrder(order) ? (
              <PermissionGate disabled={!canReceive} reason="Tu rol no tiene permiso para registrar recepciones.">
              <button
                className="link-button"
                disabled={!canReceive}
                onClick={() => onReceive(order)}
                type="button"
              >
                Recibir
              </button>
              </PermissionGate>
            ) : null}
            {isDraftOrder(order) ? (
              <PermissionGate disabled={!canManage} reason="Tu rol no tiene permiso para eliminar ordenes.">
              <button
                className="link-button link-button--danger"
                disabled={isSubmitting || !canManage}
                onClick={() => onDelete(order)}
                type="button"
              >
                Eliminar
              </button>
              </PermissionGate>
            ) : null}
          </div>,
        ];
      })}
    />
  );
}
