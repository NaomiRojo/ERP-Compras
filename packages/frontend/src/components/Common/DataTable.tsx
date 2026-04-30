import type { ReactNode } from "react";
import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

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
    <Paper className="panel" component="section">
      <Stack className="panel__header" direction={{ xs: "column", sm: "row" }} spacing={2}>
        <div>
          <Typography component="h3" variant="h6">
            {title}
          </Typography>
          <Typography color="text.secondary">{description}</Typography>
        </div>
        {actions ? <div className="panel__actions">{actions}</div> : null}
      </Stack>

      <TableContainer className="table-wrap">
        <Table className="data-table" size="small">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((cells, rowIndex) => (
                <TableRow key={rowIndex}>
                  {cells.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="table-empty" colSpan={headers.length}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
