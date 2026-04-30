import type { ReactNode } from "react";

import { Badge } from "../Common/Badge";
import { resolveTone } from "../../mocks/data";
import type { Order } from "../../types";

type OrderDetailProps = {
  order: Order;
  onBack: () => void;
  actions?: ReactNode;
};

export function OrderDetail({ order, onBack, actions }: OrderDetailProps) {
  return (
    <section className="detail-layout">
      <div className="detail-layout__main">
        <div className="panel">
          <div className="panel__header">
            <div>
              <h3>OC-{order.docNum}</h3>
              <p>{order.proveedor}</p>
            </div>
            <div className="header-chip-group">
              <Badge tone={resolveTone(order.estado)}>{order.estado}</Badge>
              {actions}
            </div>
          </div>

          <div className="summary-grid summary-grid--four">
            <div>
              <span>Fecha</span>
              <strong>{order.fecha}</strong>
            </div>
            <div>
              <span>Vencimiento</span>
              <strong>{order.fechaVencimiento ? new Date(order.fechaVencimiento).toLocaleDateString("es-BO") : "-"}</strong>
            </div>
            <div>
              <span>Moneda</span>
              <strong>{order.moneda}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{order.moneda} {order.total.toLocaleString()}</strong>
            </div>
          </div>

          <div className="summary-grid summary-grid--four">
            <div>
              <span>Subtotal</span>
              <strong>{order.moneda} {order.subtotal.toLocaleString()}</strong>
            </div>
            <div>
              <span>Descuento</span>
              <strong>{order.moneda} {order.descuentoTotal.toLocaleString()}</strong>
            </div>
            <div>
              <span>Impuestos</span>
              <strong>{order.moneda} {order.impuestosTotal.toLocaleString()}</strong>
            </div>
            <div>
              <span>Pendiente</span>
              <strong>
                {order.lines.reduce((accumulator, line) => accumulator + line.pendingQty, 0).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="detail-copy">
            <strong>Comentarios</strong>
            <p>{order.comentarios || "Sin comentarios."}</p>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Descripcion</th>
                  <th>Cantidad</th>
                  <th>Pendiente</th>
                  <th>Precio</th>
                  <th>Desc.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((line) => (
                  <tr key={`${order.id}-${line.sku}`}>
                    <td>{line.sku}</td>
                    <td>{line.description}</td>
                    <td>{line.qty}</td>
                    <td>{line.pendingQty}</td>
                    <td>{order.moneda} {line.price.toLocaleString()}</td>
                    <td>{order.moneda} {line.discount.toLocaleString()}</td>
                    <td>{order.moneda} {line.lineTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <aside className="detail-layout__side">
        <div className="panel">
          <div className="panel__header">
            <div>
              <h3>Timeline</h3>
              <p>Eventos del documento</p>
            </div>
            <button className="secondary-button" onClick={onBack} type="button">
              Volver
            </button>
          </div>
          <div className="timeline">
            {order.timeline.map((event) => (
              <article className="timeline__item" key={`${event.date}-${event.action}`}>
                <strong>{event.action}</strong>
                <span>{event.date}</span>
                <p>{event.user}</p>
                <small>{event.note}</small>
              </article>
            ))}
          </div>
          <div className="detail-copy">
            <strong>Responsables</strong>
            <p>Creada por {order.createdBy}</p>
            <p>{order.approvedBy ? `Aprobada por ${order.approvedBy}` : "Sin aprobacion registrada"}</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
