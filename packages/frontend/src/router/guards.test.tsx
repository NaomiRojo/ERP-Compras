import { describe, expect, it } from "bun:test";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import { RequireAuth } from "./guards";

function LoginProbe() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "";

  return (
    <div>
      <span>{location.pathname}</span>
      <span>{from}</span>
    </div>
  );
}

describe("RequireAuth", () => {
  it("renderiza el contenido cuando la sesion esta autenticada", () => {
    const view = render(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <Routes>
          <Route
            element={
              <RequireAuth isAuthenticated>
                <div>Dashboard protegido</div>
              </RequireAuth>
            }
            path="/app/dashboard"
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(view.getByText("Dashboard protegido")).toBeTruthy();
  });

  it("redirige al login y conserva la ruta origen cuando no hay sesion", () => {
    const view = render(
      <MemoryRouter initialEntries={["/app/proveedores?estado=activo"]}>
        <Routes>
          <Route element={<LoginProbe />} path="/auth/login" />
          <Route
            element={
              <RequireAuth isAuthenticated={false}>
                <div>Contenido privado</div>
              </RequireAuth>
            }
            path="/app/proveedores"
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(view.getByText("/auth/login")).toBeTruthy();
    expect(view.getByText("/app/proveedores?estado=activo")).toBeTruthy();
  });
});
