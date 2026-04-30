import { resolveTone } from "../../mocks/data";
import type { Order } from "../../types";
import { Badge } from "../Common/Badge";
import { CrudToolbar } from "../Common/CrudToolbar";
import { DataTable } from "../Common/DataTable";

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
}: OrdersTableProps) {
  return (
    <DataTable
      title="Ordenes de compra"
      description="Gestion documental completa: borradores, aprobacion y recepcion."
      headers={["Documento", "Proveedor", "Fecha", "Estado", "Total", "Pendiente", "Acciones"]}
      actions={
        <CrudToolbar
          createActionDisabled={createDisabled}
          createActionLabel={canManage ? "Nueva orden" : undefined}
          onCreateAction={canManage ? onCreate : undefined}
          onSearchChange={onSearchTermChange}
          searchPlaceholder="OC, proveedor, estado, SKU..."
          searchValue={searchTerm}
        />
      }
      emptyMessage="No hay ordenes que coincidan con la busqueda."
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
            {canManage && isDraftOrder(order) ? (
              <button className="link-button" onClick={() => onEdit(order)} type="button">
                Editar
              </button>
            ) : null}
            {canApprove && isDraftOrder(order) ? (
              <button
                className="link-button"
                disabled={isSubmitting}
                onClick={() => onApprove(order)}
                type="button"
              >
                Aprobar
              </button>
            ) : null}
            {canReceive && isReceivableOrder(order) ? (
              <button className="link-button" onClick={() => onReceive(order)} type="button">
                Recibir
              </button>
            ) : null}
            {canManage && isDraftOrder(order) ? (
              <button
                className="link-button link-button--danger"
                disabled={isSubmitting}
                onClick={() => onDelete(order)}
                type="button"
              >
                Eliminar
              </button>
            ) : null}
          </div>,
        ];
      })}
    />
  );
}
