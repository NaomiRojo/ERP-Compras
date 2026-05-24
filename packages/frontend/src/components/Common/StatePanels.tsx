import { Alert, Box, Button, LinearProgress, Paper, Skeleton, Stack, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";

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
      <Stack spacing={2.25}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              alignItems: "center",
              bgcolor: "rgba(33, 86, 217, 0.12)",
              borderRadius: 2,
              color: "primary.main",
              display: "grid",
              height: 34,
              justifyContent: "center",
              width: 34,
            }}
          >
            <SyncRoundedIcon className="spin" fontSize="small" />
          </Box>
          <div>
          <Typography component="h3" variant="h6">
            {title}
          </Typography>
          <Typography color="text.secondary">{message}</Typography>
          </div>
        </Stack>
        <LinearProgress sx={{ borderRadius: 999, height: 8 }} />
        <Skeleton animation="wave" height={18} sx={{ borderRadius: 1.5 }} width="70%" />
        <Skeleton animation="wave" height={18} sx={{ borderRadius: 1.5 }} width="54%" />
      </Stack>
    </Paper>
  );
}
