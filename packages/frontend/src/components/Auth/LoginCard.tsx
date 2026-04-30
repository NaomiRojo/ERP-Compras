import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  Link,
  NativeSelect,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { SessionPersistence } from "../../utils/session";

type LoginPayload = {
  email: string;
  password: string;
  persistence: SessionPersistence;
  twoFactorChannel?: "EMAIL" | "SMS" | "WHATSAPP" | "VOICE";
  twoFactorPhoneNumber?: string;
};

type RegisterPayload = {
  username: string;
  nombreCompleto: string;
  email: string;
  password: string;
  twoFactorEnabled: boolean;
};

type LoginCardProps = {
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmitLogin: (payload: LoginPayload) => void;
  onSubmitRegister: (payload: RegisterPayload) => Promise<void>;
};

const buildGeneratedUsername = (email: string, nombreCompleto: string): string => {
  const emailBase = email.split("@")[0]?.trim().toLowerCase() ?? "";
  const nameBase = nombreCompleto.trim().toLowerCase().replace(/\s+/g, ".");
  const normalizedBase = (emailBase || nameBase || "usuario")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);

  return `${normalizedBase || "usuario"}_${suffix}`;
};

const DEFAULT_SESSION_PERSISTENCE: SessionPersistence = "session";

export function LoginCard({
  isSubmitting,
  errorMessage,
  onSubmitLogin,
  onSubmitRegister,
}: LoginCardProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(false);
  const [twoFactorChannel, setTwoFactorChannel] = useState<
    "" | "EMAIL" | "SMS" | "WHATSAPP" | "VOICE"
  >("");
  const [twoFactorPhoneNumber, setTwoFactorPhoneNumber] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const expectsPhoneNumber =
    twoFactorChannel === "SMS" || twoFactorChannel === "WHATSAPP" || twoFactorChannel === "VOICE";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "login") {
      setSuccessMessage(null);
      onSubmitLogin({
        email,
        password,
        persistence: rememberSession ? "local" : DEFAULT_SESSION_PERSISTENCE,
        twoFactorChannel: twoFactorChannel || undefined,
        twoFactorPhoneNumber: expectsPhoneNumber ? twoFactorPhoneNumber.trim() || undefined : undefined,
      });
      return;
    }

    try {
      await onSubmitRegister({
        username: buildGeneratedUsername(email, nombreCompleto),
        nombreCompleto,
        email,
        password,
        twoFactorEnabled,
      });

      setSuccessMessage("Usuario registrado. Ahora inicia sesion.");
      setMode("login");
      setNombreCompleto("");
    } catch {
      setSuccessMessage(null);
    }
  };

  return (
    <Card className="auth-card" component="section">
      <CardContent>
        <Stack className="auth-header" direction="row" spacing={2}>
          <Box className="brand-mark">EC</Box>
          <Box>
            <Typography component="h1" variant="h5">
              ERP Compras
            </Typography>
            <Typography color="text.secondary">Gestion profesional de abastecimiento</Typography>
          </Box>
        </Stack>

        <Stack className="auth-form" component="form" onSubmit={submit}>
          {mode === "register" ? (
            <>
              <TextField
                disabled={isSubmitting}
                label="Nombre completo"
                onChange={(event) => setNombreCompleto(event.target.value)}
                required
                slotProps={{
                  htmlInput: {
                    "aria-label": "Nombre completo",
                  },
                }}
                value={nombreCompleto}
              />
              <Typography className="auth-feedback auth-feedback--hint" color="text.secondary">
                El usuario se genera automaticamente a partir de tus datos.
              </Typography>
              <FormControlLabel
                className="auth-checkbox"
                control={
                  <Checkbox
                    checked={twoFactorEnabled}
                    disabled={isSubmitting}
                    onChange={(event) => setTwoFactorEnabled(event.target.checked)}
                  />
                }
                label="Activar segundo factor al crear la cuenta"
              />
            </>
          ) : null}

          <TextField
            autoComplete="username"
            disabled={isSubmitting}
            label="Correo electronico"
            onChange={(event) => setEmail(event.target.value)}
            required
            slotProps={{
              htmlInput: {
                "aria-label": "Correo electronico",
              },
            }}
            type="email"
            value={email}
          />

          <TextField
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            disabled={isSubmitting}
            label="Contrasena"
            onChange={(event) => setPassword(event.target.value)}
            required
            slotProps={{
              htmlInput: {
                "aria-label": "Contrasena",
              },
            }}
            type="password"
            value={password}
          />

          {mode === "login" ? (
            <>
              <FormControlLabel
                className="auth-checkbox"
                control={
                  <Checkbox
                    checked={rememberSession}
                    disabled={isSubmitting}
                    onChange={(event) => setRememberSession(event.target.checked)}
                  />
                }
                label="Recordarme en este equipo"
              />
              <Typography className="auth-feedback auth-feedback--hint" color="text.secondary">
                Si no activas esta opcion, la sesion se cerrara al cerrar la pestana o por inactividad.
              </Typography>

              <FormControl fullWidth variant="outlined">
                <InputLabel htmlFor="two-factor-channel">Canal 2FA</InputLabel>
                <NativeSelect
                  disabled={isSubmitting}
                  inputProps={{
                    "aria-label": "Canal 2FA",
                    id: "two-factor-channel",
                  }}
                  onChange={(event) =>
                    setTwoFactorChannel(
                      event.target.value as "" | "EMAIL" | "SMS" | "WHATSAPP" | "VOICE",
                    )
                  }
                  value={twoFactorChannel}
                >
                  <option value="">Usar configuracion del servidor</option>
                  <option value="EMAIL">Correo</option>
                  <option value="SMS">SMS</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="VOICE">Llamada</option>
                </NativeSelect>
              </FormControl>

              {expectsPhoneNumber ? (
                <>
                  <TextField
                    disabled={isSubmitting}
                    label="Numero para 2FA"
                    onChange={(event) => setTwoFactorPhoneNumber(event.target.value)}
                    placeholder="+59171234567"
                    slotProps={{
                      htmlInput: {
                        "aria-label": "Numero para 2FA",
                      },
                    }}
                    type="tel"
                    value={twoFactorPhoneNumber}
                  />
                  <Typography className="auth-feedback auth-feedback--hint" color="text.secondary">
                    Usa formato E.164. Si lo dejas vacio, el backend intentara usar
                    `TWO_FACTOR_PHONE_OVERRIDE`.
                  </Typography>
                </>
              ) : null}
            </>
          ) : null}

          {errorMessage ? (
            <Alert className="auth-feedback auth-feedback--error" severity="error">
              {errorMessage}
            </Alert>
          ) : null}
          {successMessage ? (
            <Alert className="auth-feedback auth-feedback--hint" severity="success">
              {successMessage}
            </Alert>
          ) : null}

          <Button className="primary-button" disabled={isSubmitting} type="submit" variant="contained">
            {mode === "login"
              ? isSubmitting
                ? "Validando..."
                : "Iniciar sesion"
              : isSubmitting
                ? "Registrando..."
                : "Registrarse"}
          </Button>

          <Link
            className="link-button"
            component="button"
            disabled={isSubmitting}
            onClick={() => {
              setSuccessMessage(null);
              setMode((value) => (value === "login" ? "register" : "login"));
            }}
            type="button"
            underline="hover"
          >
            {mode === "login" ? "Crear una cuenta" : "Ya tengo cuenta"}
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
}
