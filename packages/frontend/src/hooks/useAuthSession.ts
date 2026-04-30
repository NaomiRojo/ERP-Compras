import { useCallback, useEffect, useRef, useState } from "react";

import { authService, type AuthService } from "../api/auth";
import { ApiError, setAccessTokenResolver } from "../api/http";
import { sessionIdleTimeoutMs } from "../config";
import type { UsuarioApi } from "../types/api";
import { resolveErrorMessage } from "../utils/errors";
import { clearSession, loadSession, saveSession, type SessionTokens } from "../utils/session";
import { useInactivityTimeout } from "./useInactivityTimeout";

export type AuthStep = "booting" | "login" | "two-factor" | "authenticated";

type PendingTwoFactor = {
  challengeId: string;
  previewCode?: string;
  persistence: SessionTokens["persistence"];
};

type ResolveCurrentUserResult = {
  activeSession: SessionTokens;
  user: UsuarioApi;
};

type LoginPayload = {
  email: string;
  password: string;
  persistence: SessionTokens["persistence"];
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

export type UseAuthSessionResult = {
  authStep: AuthStep;
  authIsSubmitting: boolean;
  authErrorMessage: string | null;
  currentUser: UsuarioApi | null;
  isAuthenticated: boolean;
  onBackToLogin: () => void;
  onConfirmTwoFactor: (code: string) => void;
  onLogout: () => void;
  onResendTwoFactor: () => void;
  onSubmitLogin: (payload: LoginPayload) => void;
  onSubmitRegister: (payload: RegisterPayload) => Promise<void>;
  pendingTwoFactor: PendingTwoFactor | null;
  executeWithAuth: <T>(operation: () => Promise<T>) => Promise<T>;
};

type UseAuthSessionOptions = {
  service?: AuthService;
};

export function useAuthSession({
  service = authService,
}: UseAuthSessionOptions = {}): UseAuthSessionResult {
  const [authStep, setAuthStep] = useState<AuthStep>("booting");
  const [authIsSubmitting, setAuthIsSubmitting] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [pendingTwoFactor, setPendingTwoFactor] = useState<PendingTwoFactor | null>(null);
  const [session, setSession] = useState<SessionTokens | null>(null);
  const [currentUser, setCurrentUser] = useState<UsuarioApi | null>(null);

  const sessionRef = useRef<SessionTokens | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    setAccessTokenResolver(() => sessionRef.current?.accessToken ?? null);

    return () => {
      setAccessTokenResolver(null);
    };
  }, []);

  const updateSessionState = useCallback((nextSession: SessionTokens | null) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
  }, []);

  const clearRuntimeSession = useCallback(() => {
    clearSession();
    updateSessionState(null);
    setCurrentUser(null);
    setPendingTwoFactor(null);
    setAuthStep("login");
  }, [updateSessionState]);

  const expireSession = useCallback(
    (message: string) => {
      clearRuntimeSession();
      setAuthErrorMessage(message);
    },
    [clearRuntimeSession],
  );

  useInactivityTimeout({
    enabled: authStep === "authenticated",
    timeoutMs: sessionIdleTimeoutMs,
    onTimeout: () => {
      expireSession("La sesion expiro por inactividad. Inicia sesion nuevamente.");
    },
  });

  const refreshSessionTokens = useCallback(async (activeSession: SessionTokens): Promise<SessionTokens | null> => {
    try {
      const refreshed = await service.refresh({ refreshToken: activeSession.refreshToken });
      const nextSession = {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        persistence: activeSession.persistence,
      };

      saveSession(nextSession);
      updateSessionState(nextSession);
      return nextSession;
    } catch {
      return null;
    }
  }, [service, updateSessionState]);

  const resolveCurrentUserSession = useCallback(
    async (initialSession: SessionTokens): Promise<ResolveCurrentUserResult> => {
      let activeSession = initialSession;

      try {
        const user = await service.me(activeSession.accessToken);
        return { activeSession, user };
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error;
        }

        const refreshed = await refreshSessionTokens(activeSession);
        if (!refreshed) {
          throw new Error("La sesion expiro. Inicia sesion nuevamente.");
        }

        activeSession = refreshed;
        const user = await service.me(activeSession.accessToken);
        return { activeSession, user };
      }
    },
    [refreshSessionTokens, service],
  );

  const establishAuthenticatedSession = useCallback(
    async (nextSession: SessionTokens): Promise<void> => {
      saveSession(nextSession);
      updateSessionState(nextSession);

      const { activeSession, user } = await resolveCurrentUserSession(nextSession);
      updateSessionState(activeSession);
      setCurrentUser(user);
      setAuthStep("authenticated");
      setPendingTwoFactor(null);
      setAuthErrorMessage(null);
    },
    [resolveCurrentUserSession, updateSessionState],
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const storedSession = loadSession();
      if (!storedSession) {
        if (!cancelled) {
          setAuthStep("login");
        }
        return;
      }

      setAuthIsSubmitting(true);
      try {
        const { activeSession, user } = await resolveCurrentUserSession(storedSession);
        if (cancelled) {
          return;
        }

        updateSessionState(activeSession);
        setCurrentUser(user);
        setAuthStep("authenticated");
        setAuthErrorMessage(null);
      } catch {
        if (!cancelled) {
          clearRuntimeSession();
        }
      } finally {
        if (!cancelled) {
          setAuthIsSubmitting(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [clearRuntimeSession, resolveCurrentUserSession, updateSessionState]);

  const onSubmitLogin = useCallback(
    async ({
      email,
      password,
      persistence,
      twoFactorChannel,
      twoFactorPhoneNumber,
    }: LoginPayload) => {
      setAuthIsSubmitting(true);
      setAuthErrorMessage(null);

      try {
        const result = await service.login({
          email,
          password,
          twoFactorChannel,
          twoFactorPhoneNumber,
        });

        if (result.requiresTwoFactor) {
          setPendingTwoFactor({
            challengeId: result.challengeId,
            previewCode: result.previewCode,
            persistence,
          });
          setAuthStep("two-factor");
          return;
        }

        await establishAuthenticatedSession({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          persistence,
        });
      } catch (error) {
        setAuthErrorMessage(resolveErrorMessage(error));
      } finally {
        setAuthIsSubmitting(false);
      }
    },
    [establishAuthenticatedSession, service],
  );

  const onSubmitRegister = useCallback(
    async ({
      username,
      nombreCompleto,
      email,
      password,
      twoFactorEnabled,
    }: RegisterPayload): Promise<void> => {
      setAuthIsSubmitting(true);
      setAuthErrorMessage(null);

      try {
        await service.register({
          username,
          nombreCompleto,
          email,
          password,
          twoFactorEnabled,
        });
      } catch (error) {
        setAuthErrorMessage(resolveErrorMessage(error));
        throw error;
      } finally {
        setAuthIsSubmitting(false);
      }
    },
    [service],
  );

  const onConfirmTwoFactor = useCallback(
    async (code: string) => {
      if (!pendingTwoFactor) {
        setAuthErrorMessage("No hay un desafio 2FA activo");
        setAuthStep("login");
        return;
      }

      const normalizedCode = code.trim();
      if (!normalizedCode) {
        setAuthErrorMessage("Ingresa el codigo de verificacion");
        return;
      }

      setAuthIsSubmitting(true);
      setAuthErrorMessage(null);

      try {
        const tokens = await service.verifyTwoFactor({
          challengeId: pendingTwoFactor.challengeId,
          code: normalizedCode,
        });

        await establishAuthenticatedSession({
          ...tokens,
          persistence: pendingTwoFactor.persistence,
        });
      } catch (error) {
        setAuthErrorMessage(resolveErrorMessage(error));
      } finally {
        setAuthIsSubmitting(false);
      }
    },
    [establishAuthenticatedSession, pendingTwoFactor, service],
  );

  const onResendTwoFactor = useCallback(async () => {
    if (!pendingTwoFactor) {
      setAuthErrorMessage("No hay un desafio 2FA activo");
      setAuthStep("login");
      return;
    }

    setAuthIsSubmitting(true);
    setAuthErrorMessage(null);

    try {
      const result = await service.resendTwoFactor({
        challengeId: pendingTwoFactor.challengeId,
      });

      setPendingTwoFactor({
        challengeId: result.challengeId,
        previewCode: result.previewCode,
        persistence: pendingTwoFactor.persistence,
      });
    } catch (error) {
      setAuthErrorMessage(resolveErrorMessage(error));
    } finally {
      setAuthIsSubmitting(false);
    }
  }, [pendingTwoFactor, service]);

  const onBackToLogin = useCallback(() => {
    setAuthErrorMessage(null);
    setPendingTwoFactor(null);
    setAuthStep("login");
  }, []);

  const onLogout = useCallback(() => {
    clearRuntimeSession();
    setAuthErrorMessage(null);
  }, [clearRuntimeSession]);

  const executeWithAuth = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      const activeRuntimeSession = sessionRef.current;
      if (!activeRuntimeSession) {
        throw new Error("La sesion no esta disponible");
      }

      let activeSession = activeRuntimeSession;

      try {
        return await operation();
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error;
        }

        const refreshed = await refreshSessionTokens(activeSession);
        if (!refreshed) {
          const message = "La sesion expiro. Inicia sesion nuevamente.";
          expireSession(message);
          throw new Error(message);
        }

        activeSession = refreshed;
        return operation();
      }
    },
    [expireSession, refreshSessionTokens],
  );

  return {
    authStep,
    authIsSubmitting,
    authErrorMessage,
    currentUser,
    executeWithAuth,
    isAuthenticated: authStep === "authenticated",
    onBackToLogin,
    onConfirmTwoFactor,
    onLogout,
    onResendTwoFactor,
    onSubmitLogin,
    onSubmitRegister,
    pendingTwoFactor,
  };
}
