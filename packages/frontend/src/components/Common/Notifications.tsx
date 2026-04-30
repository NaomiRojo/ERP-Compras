import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";

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
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = useCallback(
    (message: string, severity: NotificationSeverity = "info") => {
      setNotification({
        id: Date.now(),
        message,
        severity,
      });
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
        autoHideDuration={5200}
        key={notification?.id}
        onClose={() => setNotification(null)}
        open={notification !== null}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.severity ?? "info"}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {notification?.message}
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
