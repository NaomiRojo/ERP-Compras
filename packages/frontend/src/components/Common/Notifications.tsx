import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Alert, IconButton, Slide, Snackbar, type SlideProps } from "@mui/material";

type NotificationSeverity = "success" | "info" | "warning" | "error";

type Notification = {
  id: number;
  message: string;
  severity: NotificationSeverity;
};

type NotificationsContextValue = {
  notify: (message: string, severity?: NotificationSeverity) => void;
  notifyError: (message: string) => void;
  notifySuccess: (message: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Notification[]>([]);
  const activeNotification = queue[0] ?? null;

  const notify = useCallback(
    (message: string, severity: NotificationSeverity = "info") => {
      setQueue((current) => [
        ...current,
        {
          id: Date.now(),
          message,
          severity,
        },
      ]);
    },
    [],
  );

  const value = useMemo(
    () => ({
      notify,
      notifyError: (message: string) => notify(message, "error"),
      notifySuccess: (message: string) => notify(message, "success"),
    }),
    [notify],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <Snackbar
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        autoHideDuration={5400}
        key={activeNotification?.id}
        onClose={(_, reason) => {
          if (reason === "clickaway") {
            return;
          }

          setQueue((current) => current.slice(1));
        }}
        open={activeNotification !== null}
        slots={{ transition: Slide }}
        slotProps={{ transition: { direction: "left" } as SlideProps }}
      >
        <Alert
          action={
            <IconButton
              aria-label="Cerrar notificacion"
              color="inherit"
              onClick={() => setQueue((current) => current.slice(1))}
              size="small"
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          onClose={() => setQueue((current) => current.slice(1))}
          severity={activeNotification?.severity ?? "info"}
          sx={{ maxWidth: 480, width: "100%" }}
          variant="filled"
        >
          {activeNotification?.message}
        </Alert>
      </Snackbar>
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  }

  return context;
}
