import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { Button, Paper, Stack, Typography } from "@mui/material";

type ServerErrorScreenProps = {
  actionLabel: string;
  description?: string;
  onPrimaryAction: () => void;
  title?: string;
};

export function ServerErrorScreen({
  actionLabel,
  description = "El servidor devolvio un error inesperado. Reintenta en unos minutos o contacta al equipo de soporte.",
  onPrimaryAction,
  title = "Error del servidor",
}: ServerErrorScreenProps) {
  return (
    <main className="status-screen">
      <Paper className="status-card" component="section">
        <Stack spacing={2.5}>
          <div className="status-icon status-icon--error">
            <ReportProblemIcon />
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
