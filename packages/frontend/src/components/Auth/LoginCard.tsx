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
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

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

const DEFAULT_SESSION_PERSISTENCE: SessionPersistence = "session";
const DEFAULT_TWO_FACTOR_CHANNEL: NonNullable<LoginPayload["twoFactorChannel"]> = "WHATSAPP";

const buildGeneratedUsername = (email: string, nombreCompleto: string): string => {
  const emailBase = email.split("@")[0]?.trim().toLowerCase() ?? "";
  const nameBase = nombreCompleto.trim().toLowerCase().replace(/\s+/g, ".");
  const normalizedBase = (emailBase || nameBase || "usuario")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);

  return `${normalizedBase || "usuario"}_${suffix}`;
};

const phoneCountries = [
  { code: "BO", label: "Bolivia", dialCode: "+591" },
  { code: "AR", label: "Argentina", dialCode: "+54" },
  { code: "BR", label: "Brasil", dialCode: "+55" },
  { code: "CL", label: "Chile", dialCode: "+56" },
  { code: "PE", label: "Perú", dialCode: "+51" },
  { code: "US", label: "Estados Unidos", dialCode: "+1" },
] as const;

const CountryCodeBadge = ({ code }: { code: string }) => (
  <Box
    component="span"
    sx={{
      alignItems: "center",
      bgcolor: "rgba(37, 99, 235, 0.1)",
      border: "1px solid rgba(37, 99, 235, 0.18)",
      borderRadius: 1.5,
      color: "primary.main",
      display: "inline-flex",
      fontSize: 12,
      fontWeight: 900,
      height: 26,
      justifyContent: "center",
      minWidth: 36,
    }}
  >
    {code}
  </Box>
);

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
  const [phoneCountryCode, setPhoneCountryCode] = useState<(typeof phoneCountries)[number]["code"]>("BO");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const selectedCountry =
    phoneCountries.find((country) => country.code === phoneCountryCode) ?? phoneCountries[0];

  const normalizedPhoneNumber = phoneNumber.replace(/\D/g, "");
  const twoFactorPhoneNumber = normalizedPhoneNumber
    ? `${selectedCountry.dialCode}${normalizedPhoneNumber}`
    : undefined;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "login") {
      setSuccessMessage(null);
      onSubmitLogin({
        email,
        password,
        persistence: rememberSession ? "local" : DEFAULT_SESSION_PERSISTENCE,
        twoFactorChannel: DEFAULT_TWO_FACTOR_CHANNEL,
        twoFactorPhoneNumber,
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

      setSuccessMessage("Cuenta registrada. Ahora inicia sesión.");
      setMode("login");
      setNombreCompleto("");
      setTwoFactorEnabled(true);
    } catch {
      setSuccessMessage(null);
    }
  };

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setSuccessMessage(null);
  };

  return (
    <Card className="auth-card" component="section">
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Stack className="auth-header" direction="row" spacing={2}>
          <Box className="brand-mark">EC</Box>
          <Box>
            <Typography component="h1" variant="h5">
              ERP Compras
            </Typography>
            <Typography color="text.secondary">Gestión profesional de abastecimiento</Typography>
          </Box>
        </Stack>

        <Paper
          sx={{
            bgcolor: "rgba(33, 86, 217, 0.04)",
            borderColor: "rgba(33, 86, 217, 0.12)",
            mb: 2.25,
            p: 0.5,
          }}
          variant="outlined"
        >
          <Tabs
            aria-label="Modo de autenticación"
            onChange={(_event, value) => switchMode(value as "login" | "register")}
            sx={{
              minHeight: 38,
              ".MuiTabs-flexContainer": {
                gap: 0.5,
              },
              ".MuiTabs-indicator": {
                display: "none",
              },
              ".MuiTab-root": {
                borderRadius: 1.5,
                color: "text.secondary",
                fontWeight: 800,
                letterSpacing: 0,
                minHeight: 36,
                py: 0.75,
              },
              ".MuiTab-root.Mui-selected": {
                bgcolor: "background.paper",
                boxShadow: "0 8px 18px rgba(33, 86, 217, 0.12)",
                color: "primary.main",
              },
            }}
            value={mode}
            variant="fullWidth"
          >
            <Tab label="Acceso" value="login" />
            <Tab label="Registro" value="register" />
          </Tabs>
        </Paper>

        <Stack className="auth-form" component="form" onSubmit={submit}>
          {mode === "register" ? (
            <>
              <TextField
                autoComplete="name"
                disabled={isSubmitting}
                label="Nombre completo"
                helperText="El usuario se generará automáticamente a partir del correo."
                onChange={(event) => setNombreCompleto(event.target.value)}
                slotProps={{
                  htmlInput: {
                    "aria-label": "Nombre completo",
                    required: true,
                  },
                }}
                value={nombreCompleto}
              />
            </>
          ) : null}

          <TextField
            autoComplete="username"
            disabled={isSubmitting}
            label="Correo electrónico"
            onChange={(event) => setEmail(event.target.value)}
            slotProps={{
              htmlInput: {
                "aria-label": "Correo electrónico",
                required: true,
              },
            }}
            type="email"
            value={email}
          />

          <TextField
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            disabled={isSubmitting}
            label="Contraseña"
            onChange={(event) => setPassword(event.target.value)}
            slotProps={{
              htmlInput: {
                "aria-label": "Contraseña",
                required: true,
              },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      disabled={isSubmitting}
                      edge="end"
                      onClick={() => setShowPassword((current) => !current)}
                      onMouseDown={(event) => event.preventDefault()}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            type={showPassword ? "text" : "password"}
            value={password}
          />

          {mode === "register" ? (
            <Paper
              sx={{
                bgcolor: "rgba(33, 86, 217, 0.04)",
                borderColor: "rgba(33, 86, 217, 0.12)",
                p: 1.25,
              }}
              variant="outlined"
            >
              <FormControlLabel
                className="auth-checkbox"
                control={
                  <Checkbox
                    checked={twoFactorEnabled}
                    disabled={isSubmitting}
                    onChange={(event) => setTwoFactorEnabled(event.target.checked)}
                    slotProps={{
                      input: {
                        "aria-label": "Activar verificación de dos pasos al crear la cuenta",
                      },
                    }}
                    sx={{ mt: -0.25 }}
                  />
                }
                label={
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800 }} variant="body2">
                      Activar verificación de dos pasos
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      al crear la cuenta
                    </Typography>
                  </Box>
                }
                sx={{
                  alignItems: "flex-start",
                  m: 0,
                  width: "100%",
                  ".MuiFormControlLabel-label": {
                    flex: 1,
                    minWidth: 0,
                  },
                }}
              />
            </Paper>
          ) : (
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
                sx={{ alignItems: "center", m: 0 }}
              />

              <Paper
                sx={{
                  bgcolor: "rgba(18, 140, 126, 0.06)",
                  borderColor: "rgba(18, 140, 126, 0.22)",
                  p: 1.75,
                }}
                variant="outlined"
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Box
                    sx={{
                      alignItems: "center",
                      bgcolor: "#128c7e",
                      borderRadius: 2,
                      color: "#fff",
                      display: "grid",
                      flex: "0 0 auto",
                      height: 42,
                      justifyContent: "center",
                      width: 42,
                    }}
                  >
                    <WhatsAppIcon fontSize="small" />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800 }} variant="body1">
                      Verificación de dos pasos
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      El código de acceso se enviará por WhatsApp.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: { sm: "minmax(170px, 0.48fr) minmax(0, 1fr)", xs: "1fr" },
                }}
              >
                <FormControl fullWidth>
                  <InputLabel id="phone-country-label">País</InputLabel>
                  <Select
                    disabled={isSubmitting}
                    label="País"
                    labelId="phone-country-label"
                    onChange={(event) =>
                      setPhoneCountryCode(event.target.value as (typeof phoneCountries)[number]["code"])
                    }
                    renderValue={(value) => {
                      const country =
                        phoneCountries.find((item) => item.code === value) ?? selectedCountry;

                      return (
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <CountryCodeBadge code={country.code} />
                          <Typography component="span" sx={{ fontWeight: 700 }}>
                            {country.dialCode}
                          </Typography>
                        </Stack>
                      );
                    }}
                    slotProps={{
                      input: {
                        "aria-label": "País",
                      },
                    }}
                    sx={{
                      ".MuiSelect-select": {
                        alignItems: "center",
                        display: "flex",
                        minHeight: 34,
                      },
                    }}
                    value={phoneCountryCode}
                  >
                    {phoneCountries.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        <Stack
                          direction="row"
                          spacing={1.25}
                          sx={{ alignItems: "center", py: 0.35, width: "100%" }}
                        >
                          <CountryCodeBadge code={country.code} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800 }}>{country.label}</Typography>
                            <Typography color="text.secondary" variant="caption">
                              Prefijo {country.dialCode}
                            </Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  disabled={isSubmitting}
                  label="Número de celular"
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="71234567"
                  slotProps={{
                    htmlInput: {
                      "aria-label": "Número de celular",
                      inputMode: "tel",
                      required: true,
                    },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">{selectedCountry.dialCode}</InputAdornment>
                      ),
                    },
                  }}
                  type="tel"
                  value={phoneNumber}
                />
              </Box>

              <Typography className="auth-feedback auth-feedback--hint" color="text.secondary">
                Ingrese su número de celular, por favor.
              </Typography>
            </>
          )}

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
                : "Iniciar sesión"
              : isSubmitting
                ? "Registrando..."
                : "Registrarse"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
