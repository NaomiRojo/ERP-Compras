import { Chip, Stack, Typography } from "@mui/material";

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
        <Typography className="eyebrow" color="text.secondary" component="p">
          Vista activa
        </Typography>
        <Typography component="h2" variant="h4">
          {title}
        </Typography>
        <Typography className="header-copy" color="text.secondary">
          {subtitle}
        </Typography>
      </div>
      <Stack className="header-actions" direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <SearchBar />
        <Chip className="search-chip" label={statusChip} variant="outlined" />
      </Stack>
    </header>
  );
}
