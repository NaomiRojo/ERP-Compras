import { matchPath, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";

import { ProtectedAppShell } from "./components/App/ProtectedAppShell";
import { AuthContainer } from "./components/Auth/AuthContainer";
import { useAuthSession } from "./hooks/useAuthSession";
import { useERPWorkspace } from "./hooks/useERPWorkspace";
import { RequireAuth } from "./router/guards";
import { NotFoundScreen, ServerErrorScreen } from "./screens";
import {
  AUTH_LOGIN_PATH,
  AUTH_TWO_FACTOR_PATH,
  getFallbackViewPath,
  isViewKey,
  resolveRedirectTarget,
} from "./router/views";

function BootScreen() {
  return (
    <main className="auth-screen">
      <Paper className="auth-card" component="section">
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box className="brand-mark">EC</Box>
          <Box>
            <Typography component="h1" variant="h5">
              ERP Compras
            </Typography>
            <Typography color="text.secondary">Validando sesion...</Typography>
          </Box>
          <CircularProgress size={24} sx={{ ml: "auto" }} />
        </Stack>
      </Paper>
    </main>
  );
}

export function App() {
  const location = useLocation();
  const auth = useAuthSession();
  const workspace = useERPWorkspace({
    currentUser: auth.currentUser,
    executeWithAuth: auth.executeWithAuth,
  });

  const matchedView = matchPath("/app/:view", location.pathname)?.params.view;
  const currentView = matchedView && isViewKey(matchedView) ? matchedView : null;

  const matchedAuthStep = matchPath("/auth/:step", location.pathname)?.params.step;
  const routeAuthStep =
    matchedAuthStep === "login" || matchedAuthStep === "two-factor"
      ? matchedAuthStep
      : null;

  const defaultProtectedPath = getFallbackViewPath(workspace.availableViews);
  const redirectAfterAuth = resolveRedirectTarget(location.state, defaultProtectedPath);
  const authEntryPath =
    auth.authStep === "two-factor" && auth.pendingTwoFactor
      ? AUTH_TWO_FACTOR_PATH
      : AUTH_LOGIN_PATH;
  const isCurrentViewAllowed =
    currentView !== null && workspace.availableViews.includes(currentView);

  if (auth.authStep === "booting") {
    return <BootScreen />;
  }

  const authScreen =
    auth.isAuthenticated ? (
      <Navigate replace to={redirectAfterAuth} />
    ) : routeAuthStep === null ? (
      <Navigate replace state={{ from: redirectAfterAuth }} to={authEntryPath} />
    ) : routeAuthStep === "two-factor" &&
      (auth.authStep !== "two-factor" || !auth.pendingTwoFactor) ? (
      <Navigate replace state={{ from: redirectAfterAuth }} to={AUTH_LOGIN_PATH} />
    ) : routeAuthStep === "login" &&
      auth.authStep === "two-factor" &&
      auth.pendingTwoFactor ? (
      <Navigate replace state={{ from: redirectAfterAuth }} to={AUTH_TWO_FACTOR_PATH} />
    ) : (
      <AuthContainer
        challengeId={auth.pendingTwoFactor?.challengeId}
        errorMessage={auth.authErrorMessage}
        isSubmitting={auth.authIsSubmitting}
        onBackToLogin={auth.onBackToLogin}
        onConfirmTwoFactor={auth.onConfirmTwoFactor}
        onResendTwoFactor={auth.onResendTwoFactor}
        onSubmitLogin={auth.onSubmitLogin}
        onSubmitRegister={auth.onSubmitRegister}
        previewCode={auth.pendingTwoFactor?.previewCode}
        step={routeAuthStep}
      />
    );

  const rootRedirectPath = auth.isAuthenticated ? defaultProtectedPath : authEntryPath;
  const notFoundActionLabel = auth.isAuthenticated ? "Volver al dashboard" : "Ir a inicio de sesion";

  return (
    <Routes>
      <Route element={<Navigate replace to={rootRedirectPath} />} path="/" />
      <Route
        element={(
          <ServerErrorScreen
            actionLabel={auth.isAuthenticated ? "Volver al dashboard" : "Ir a inicio de sesion"}
            onPrimaryAction={() => {
              window.location.hash = auth.isAuthenticated ? defaultProtectedPath : authEntryPath;
            }}
          />
        )}
        path="/error/server"
      />
      <Route
        element={
          auth.isAuthenticated ? (
            <Navigate replace to={redirectAfterAuth} />
          ) : (
            <Navigate replace state={{ from: redirectAfterAuth }} to={authEntryPath} />
          )
        }
        path="/auth"
      />
      <Route element={authScreen} path="/auth/:step" />
      <Route
        element={
          <RequireAuth isAuthenticated={auth.isAuthenticated}>
            <Navigate replace to={defaultProtectedPath} />
          </RequireAuth>
        }
        path="/app"
      />
      <Route
        element={
          <RequireAuth isAuthenticated={auth.isAuthenticated}>
            <ProtectedAppShell
              currentUser={auth.currentUser}
              currentView={currentView}
              defaultProtectedPath={defaultProtectedPath}
              isCurrentViewAllowed={isCurrentViewAllowed}
              onLogout={auth.onLogout}
              workspace={workspace}
            />
          </RequireAuth>
        }
        path="/app/:view"
      />
      <Route
        element={(
          <NotFoundScreen
            actionLabel={notFoundActionLabel}
            onPrimaryAction={() => {
              window.location.hash = auth.isAuthenticated ? defaultProtectedPath : authEntryPath;
            }}
          />
        )}
        path="*"
      />
    </Routes>
  );
}

export default App;
