import type { ReactNode } from "react";

import { Navigate, useLocation } from "react-router-dom";

import { AUTH_LOGIN_PATH } from "./views";

type RequireAuthProps = {
  isAuthenticated: boolean;
  children: ReactNode;
};

export function RequireAuth({ isAuthenticated, children }: RequireAuthProps) {
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ from: `${location.pathname}${location.search}` }}
        to={AUTH_LOGIN_PATH}
      />
    );
  }

  return <>{children}</>;
}
