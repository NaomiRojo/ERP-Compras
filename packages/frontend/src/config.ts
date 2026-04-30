const fromProcessEnv =
  typeof process !== "undefined" ? process.env.BUN_PUBLIC_API_URL : undefined;

const sessionIdleTimeoutMinutesFromEnv =
  typeof process !== "undefined"
    ? process.env.BUN_PUBLIC_SESSION_IDLE_TIMEOUT_MINUTES
    : undefined;

const DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES = 15;

export const parseSessionIdleTimeoutMinutes = (value: string | undefined): number => {
  if (!value) {
    return DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES;
  }

  return parsed;
};

export const apiBaseUrl =
  (typeof fromProcessEnv === "string" && fromProcessEnv.trim()) || "http://localhost:4000";

export const sessionIdleTimeoutMs =
  parseSessionIdleTimeoutMinutes(sessionIdleTimeoutMinutesFromEnv) * 60 * 1000;
