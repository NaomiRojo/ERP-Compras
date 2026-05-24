import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";

type SortDirection = "asc" | "desc";
type RowSortValue = string | number | boolean | Date | null | undefined;

export type DataTableRowMeta = {
  id?: number | string;
  filterValues?: Record<string, boolean | null | number | string | undefined>;
  sortValues?: RowSortValue[];
};

export type DataTableFilter = {
  id: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
};

type DataTableProps = {
  title: string;
  description: string;
  headers: string[];
  rows: ReactNode[][];
  actions?: ReactNode;
  emptyMessage?: string;
  rowMeta?: DataTableRowMeta[];
  sortableColumns?: number[];
  defaultSort?: {
    columnIndex: number;
    direction: SortDirection;
  };
  filters?: DataTableFilter[];
  pagination?: {
    enabled?: boolean;
    defaultRowsPerPage?: number;
    rowsPerPageOptions?: number[];
  };
};

const asComparableValue = (value: RowSortValue): number | string => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (value == null) {
    return "";
  }

  const normalized = String(value).trim().toLowerCase();
  const numericValue = Number(normalized);

  if (normalized && Number.isFinite(numericValue) && /^-?\d+(\.\d+)?$/.test(normalized)) {
    return numericValue;
  }

  return normalized;
};

const compareValues = (left: RowSortValue, right: RowSortValue): number => {
  const a = asComparableValue(left);
  const b = asComparableValue(right);

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b), "es");
};

export function DataTable({
  title,
  description,
  headers,
  rows,
  actions,
  emptyMessage = "No hay registros disponibles.",
  rowMeta = [],
  sortableColumns = [],
  defaultSort,
  filters = [],
  pagination,
}: DataTableProps) {
  const paginationEnabled = pagination?.enabled ?? false;
  const rowsPerPageOptions = pagination?.rowsPerPageOptions ?? [5, 10, 25, 50];
  const fallbackRowsPerPage = pagination?.defaultRowsPerPage ?? rowsPerPageOptions[1] ?? 10;
  const [sortColumn, setSortColumn] = useState<number | null>(defaultSort?.columnIndex ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction ?? "asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(fallbackRowsPerPage);

  useEffect(() => {
    setPage(0);
  }, [rows.length, sortColumn, sortDirection, rowsPerPage, filters.map((filter) => filter.value).join("|")]);

  const processedRowIndexes = useMemo(() => {
    const indexes = rows.map((_, index) => index);

    const filtered = indexes.filter((index) =>
      filters.every((filter) => {
        if (!filter.value) {
          return true;
        }

        const filterValue = rowMeta[index]?.filterValues?.[filter.id];
        return String(filterValue ?? "") === filter.value;
      }),
    );

    if (sortColumn === null) {
      return filtered;
    }

    return [...filtered].sort((leftIndex, rightIndex) => {
      const leftValue = rowMeta[leftIndex]?.sortValues?.[sortColumn];
      const rightValue = rowMeta[rightIndex]?.sortValues?.[sortColumn];
      const result = compareValues(leftValue, rightValue);
      return sortDirection === "asc" ? result : -result;
    });
  }, [filters, rowMeta, rows, sortColumn, sortDirection]);

  const visibleRowIndexes = useMemo(() => {
    if (!paginationEnabled) {
      return processedRowIndexes;
    }

    const start = page * rowsPerPage;
    return processedRowIndexes.slice(start, start + rowsPerPage);
  }, [paginationEnabled, page, processedRowIndexes, rowsPerPage]);

  const handleSort = (columnIndex: number) => {
    if (!sortableColumns.includes(columnIndex)) {
      return;
    }
44
    if (sortColumn !== columnIndex) {
      setSortColumn(columnIndex);
      setSortDirection("asc");
      return;
    }

    setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
  };

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

      {filters.length > 0 ? (
        <Stack className="table-filter-row" direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          {filters.map((filter) => (
            <FormControl key={filter.id} size="small" sx={{ minWidth: 180 }}>
              <InputLabel id={`${filter.id}-filter-label`}>{filter.label}</InputLabel>
              <Select
                label={filter.label}
                labelId={`${filter.id}-filter-label`}
                onChange={(event) => filter.onChange(event.target.value)}
                value={filter.value}
              >
                {filter.options.map((option) => (
                  <MenuItem key={`${filter.id}-${option.value}`} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Stack>
      ) : null}

      <TableContainer className="table-wrap">
        <Table className="data-table" size="small">
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell key={header}>
                  {sortableColumns.includes(index) ? (
                    <TableSortLabel
                      active={sortColumn === index}
                      direction={sortColumn === index ? sortDirection : "asc"}
                      onClick={() => handleSort(index)}
                    >
                      {header}
                    </TableSortLabel>
                  ) : (
                    header
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRowIndexes.length > 0 ? (
              visibleRowIndexes.map((rowIndex) => {
                const cells = rows[rowIndex] ?? [];
                const rowKey = rowMeta[rowIndex]?.id ?? rowIndex;

                return (
                <TableRow key={rowKey}>
                  {cells.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
                );
              })
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

      {paginationEnabled ? (
        <TablePagination
          component="div"
          count={processedRowIndexes.length}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      ) : null}
    </Paper>
  );
}
