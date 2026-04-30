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
    <div className="toolbar">
      <SearchBar
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        value={searchValue}
      />
      {createActionLabel && onCreateAction ? (
        <button
          className="primary-button"
          disabled={createActionDisabled}
          onClick={onCreateAction}
          type="button"
        >
          {createActionLabel}
        </button>
      ) : null}
    </div>
  );
}
