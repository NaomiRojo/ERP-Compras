import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";

type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function SearchBar({
  placeholder = "Buscar registros...",
  value,
  onChange,
}: SearchBarProps) {
  return (
    <TextField
      className="search-bar"
      label="Buscar"
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      size="small"
      slotProps={{
        htmlInput: {
          "aria-label": "Buscar",
        },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
      type="search"
      value={value}
      variant="outlined"
    />
  );
}
