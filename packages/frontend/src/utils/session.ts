export type SessionPersistence = "local" | "session";

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  persistence: SessionPersistence;
};

const SESSION_STORAGE_KEY = "erp_compras_session";

const parseSession = (
  raw: string | null,
  persistence: SessionPersistence,
): SessionTokens | null => {
  if (!raw) {
    return null;
  }

  try {
    const value = JSON.parse(raw) as Partial<SessionTokens>;
    if (
      typeof value.accessToken !== "string" ||
      typeof value.refreshToken !== "string" ||
      !value.accessToken.trim() ||
      !value.refreshToken.trim()
    ) {
      return null;
    }

    return {
      accessToken: value.accessToken,
      refreshToken: value.refreshToken,
      persistence:
        value.persistence === "local" || value.persistence === "session"
          ? value.persistence
          : persistence,
    };
  } catch {
    return null;
  }
};

export const loadSession = (): SessionTokens | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const localSession = parseSession(
    window.localStorage.getItem(SESSION_STORAGE_KEY),
    "local",
  );
  if (localSession) {
    return localSession;
  }

  return parseSession(window.sessionStorage.getItem(SESSION_STORAGE_KEY), "session");
};

export const saveSession = (session: SessionTokens): void => {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = JSON.stringify(session);

  if (session.persistence === "local") {
    window.localStorage.setItem(SESSION_STORAGE_KEY, serialized);
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const clearSession = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
};
