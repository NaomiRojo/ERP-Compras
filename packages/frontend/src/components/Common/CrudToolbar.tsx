import AddIcon from "@mui/icons-material/Add";
import { Button, Stack } from "@mui/material";

import { PermissionGate } from "./PermissionGate";
import { SearchBar } from "./SearchBar";

type CrudToolbarProps = {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  createActionLabel?: string;
  onCreateAction?: () => void;
  createActionDisabled?: boolean;
  createActionDisabledReason?: string;
};

export function CrudToolbar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  createActionLabel,
  onCreateAction,
  createActionDisabled = false,
  createActionDisabledReason = "Tu rol no tiene permiso para crear registros.",
}: CrudToolbarProps) {
  return (
    <Stack
      className="toolbar"
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      useFlexGap
    >
      <SearchBar
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        value={searchValue}
      />
      {createActionLabel ? (
        <PermissionGate disabled={createActionDisabled || !onCreateAction} reason={createActionDisabledReason}>
          <Button
            className="primary-button"
            disabled={createActionDisabled || !onCreateAction}
            startIcon={<AddIcon />}
            onClick={onCreateAction}
            type="button"
            variant="contained"
          >
            {createActionLabel}
          </Button>
        </PermissionGate>
      ) : null}
    </Stack>
  );
}
