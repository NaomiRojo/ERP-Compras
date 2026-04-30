import AddIcon from "@mui/icons-material/Add";
import { Button, Stack } from "@mui/material";

import { SearchBar } from "./SearchBar";

type CrudToolbarProps = {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  createActionLabel?: string;
  onCreateAction?: () => void;
  createActionDisabled?: boolean;
};

export function CrudToolbar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  createActionLabel,
  onCreateAction,
  createActionDisabled = false,
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
      {createActionLabel && onCreateAction ? (
        <Button
          className="primary-button"
          disabled={createActionDisabled}
          startIcon={<AddIcon />}
          onClick={onCreateAction}
          type="button"
          variant="contained"
        >
          {createActionLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
