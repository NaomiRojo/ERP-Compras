import { Alert, Button, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

type ErrorPanelProps = {
  message: string;
  onRetry?: () => void;
  title?: string;
};

export function ErrorPanel({
  message,
  onRetry,
  title = "No pudimos cargar la informacion",
}: ErrorPanelProps) {
  return (
    <Paper sx={{ p: 3 }} variant="outlined">
      <Stack spacing={2}>
        <Alert severity="error">
          <Typography component="strong" sx={{ display: "block", fontWeight: 700 }}>
            {title}
          </Typography>
          {message}
        </Alert>
        {onRetry ? (
          <Button onClick={onRetry} startIcon={<RefreshIcon />} sx={{ alignSelf: "flex-start" }} variant="outlined">
            Reintentar
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
}

type LoadingPanelProps = {
  message?: string;
  title?: string;
};

export function LoadingPanel({
  message = "Consultando datos del backend...",
  title = "Cargando informacion",
}: LoadingPanelProps) {
  return (
    <Paper sx={{ p: 3 }} variant="outlined">
      <Stack spacing={2}>
        <div>
          <Typography component="h3" variant="h6">
            {title}
          </Typography>
          <Typography color="text.secondary">{message}</Typography>
        </div>
        <LinearProgress />
      </Stack>
    </Paper>
  );
}
