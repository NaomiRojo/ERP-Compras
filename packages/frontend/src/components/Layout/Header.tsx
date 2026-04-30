import { SearchBar } from "../Common/SearchBar";

type HeaderProps = {
  title: string;
  subtitle: string;
  statusChip: string;
};

export function Header({ title, subtitle, statusChip }: HeaderProps) {
  return (
    <header className="content__header">
      <div>
        <p className="eyebrow">Vista activa</p>
        <h2>{title}</h2>
        <p className="header-copy">{subtitle}</p>
      </div>
      <div className="header-actions">
        <SearchBar />
        <div className="search-chip">{statusChip}</div>
      </div>
    </header>
  );
}
