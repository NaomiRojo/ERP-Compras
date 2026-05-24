import { Button, Paper, Stack, Typography } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";

type NotFoundScreenProps = {
  actionLabel: string;
  description?: string;
  onPrimaryAction: () => void;
  title?: string;
};

export function NotFoundScreen({
  actionLabel,
  description = "La ruta solicitada no existe o ya no esta disponible en este entorno.",
  onPrimaryAction,
  title = "404 - Pagina no encontrada",
}: NotFoundScreenProps) {
  return (
    <main className="status-screen">
      <Paper className="status-card" component="section">
        <Stack spacing={2.5}>
          <div className="status-icon">
            <SearchOffIcon />
          </div>
          <div>
            <Typography component="h1" variant="h4">
              {title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {description}
            </Typography>
          </div>
          <Button className="primary-button" onClick={onPrimaryAction} type="button" variant="contained">
            {actionLabel}
          </Button>
        </Stack>
      </Paper>
    </main>
  );
}
