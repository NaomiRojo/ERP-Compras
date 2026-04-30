import { matchPath, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { ProtectedAppShell } from "./components/App/ProtectedAppShell";
import { AuthContainer } from "./components/Auth/AuthContainer";
import { useAuthSession } from "./hooks/useAuthSession";
import { useERPWorkspace } from "./hooks/useERPWorkspace";
import { RequireAuth } from "./router/guards";
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
      <section className="auth-card">
        <div className="auth-header">
          <div className="brand-mark">EC</div>
          <div>
            <h1>ERP Compras</h1>
            <p>Validando sesion...</p>
          </div>
        </div>
      </section>
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

  return (
    <Routes>
      <Route element={<Navigate replace to={rootRedirectPath} />} path="/" />
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
              currentUserName={auth.currentUser?.nombreCompleto ?? "Usuario"}
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
      <Route element={<Navigate replace to={rootRedirectPath} />} path="*" />
    </Routes>
  );
}

export default App;
