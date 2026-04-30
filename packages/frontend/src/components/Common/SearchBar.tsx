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
    <label className="search-bar">
      <span>Buscar</span>
      <input
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  );
}
