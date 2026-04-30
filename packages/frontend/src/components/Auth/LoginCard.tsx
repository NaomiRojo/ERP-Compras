import { useState } from "react";

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
  >("WHATSAPP");
  const [twoFactorPhoneNumber, setTwoFactorPhoneNumber] = useState("");
  const expectsPhoneNumber =
    twoFactorChannel === "SMS" || twoFactorChannel === "WHATSAPP" || twoFactorChannel === "VOICE";
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

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
    <section className="auth-card">
      <div className="auth-header">
        <div className="brand-mark">EC</div>
        <div>
          <h1>ERP Compras</h1>
          <p>Gestion profesional de abastecimiento</p>
        </div>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {mode === "register" ? (
          <>
            <label>
              Nombre completo
              <input
                disabled={isSubmitting}
                onChange={(event) => setNombreCompleto(event.target.value)}
                required
                value={nombreCompleto}
              />
            </label>
            <p className="auth-feedback auth-feedback--hint">
              El usuario se genera automaticamente a partir de tus datos.
            </p>
            <label className="auth-checkbox">
              <input
                checked={twoFactorEnabled}
                disabled={isSubmitting}
                onChange={(event) => setTwoFactorEnabled(event.target.checked)}
                type="checkbox"
              />
              <span>Activar segundo factor al crear la cuenta</span>
            </label>
          </>
        ) : null}

        <label>
          Correo electronico
          <input
            autoComplete="username"
            disabled={isSubmitting}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label>
          Contrasena
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            disabled={isSubmitting}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {mode === "login" ? (
          <>
            <label className="auth-checkbox">
              <input
                checked={rememberSession}
                disabled={isSubmitting}
                onChange={(event) => setRememberSession(event.target.checked)}
                type="checkbox"
              />
              <span>Recordarme en este equipo</span>
            </label>
            <p className="auth-feedback auth-feedback--hint">
              Si no activas esta opcion, la sesion se cerrara al cerrar la pestana o por inactividad.
            </p>
            <p className="auth-feedback auth-feedback--hint">
              WhatsApp queda preseleccionado para agilizar el 2FA, pero puedes cambiar el canal si lo
              necesitas.
            </p>

            <label>
              Canal 2FA
              <select
                disabled={isSubmitting}
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
              </select>
            </label>

            {expectsPhoneNumber ? (
              <>
                <label>
                  Numero para 2FA
                  <input
                    disabled={isSubmitting}
                    onChange={(event) => setTwoFactorPhoneNumber(event.target.value)}
                    placeholder="+59171234567"
                    type="tel"
                    value={twoFactorPhoneNumber}
                  />
                </label>
                <p className="auth-feedback auth-feedback--hint">
                  Usa formato E.164. Si lo dejas vacio, el backend intentara usar
                  `TWO_FACTOR_PHONE_OVERRIDE`.
                </p>
              </>
            ) : null}
          </>
        ) : null}

        {errorMessage ? <p className="auth-feedback auth-feedback--error">{errorMessage}</p> : null}
        {successMessage ? <p className="auth-feedback auth-feedback--hint">{successMessage}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {mode === "login"
            ? isSubmitting
              ? "Validando..."
              : "Iniciar sesion"
            : isSubmitting
              ? "Registrando..."
              : "Registrarse"}
        </button>

        <button
          className="link-button"
          disabled={isSubmitting}
          onClick={() => {
            setSuccessMessage(null);
            setMode((value) => (value === "login" ? "register" : "login"));
          }}
          type="button"
        >
          {mode === "login" ? "Crear una cuenta" : "Ya tengo cuenta"}
        </button>
      </form>
    </section>
  );
}
