import type { ReactNode } from "react";

type DataTableProps = {
  title: string;
  description: string;
  headers: string[];
  rows: ReactNode[][];
  actions?: ReactNode;
  emptyMessage?: string;
};

export function DataTable({
  title,
  description,
  headers,
  rows,
  actions,
  emptyMessage = "No hay registros disponibles.",
}: DataTableProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {actions ? <div className="panel__actions">{actions}</div> : null}
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((cells, rowIndex) => (
                <tr key={rowIndex}>
                  {cells.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="table-empty" colSpan={headers.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
