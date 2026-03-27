import { useEffect, useState } from "react";
import { apiBaseUrl } from "./config";

type BackendHealthState =
  | { status: "loading" }
  | { status: "ok"; backendStatus: string }
  | { status: "error"; message: string };

export function App() {
  const [healthState, setHealthState] = useState<BackendHealthState>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    const loadBackendHealth = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/health`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as { status?: string };
        if (!cancelled) {
          setHealthState({
            status: "ok",
            backendStatus: payload.status ?? "unknown",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setHealthState({
            status: "error",
            message: error instanceof Error ? error.message : "No se pudo conectar al backend",
          });
        }
      }
    };

    void loadBackendHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 720, margin: "48px auto", padding: "0 20px" }}>
      <h1>ERP Compras</h1>
      <p>Frontend local conectado por entorno al backend.</p>
      <p>
        API configurada: <code>{apiBaseUrl}</code>
      </p>
      <p>
        Estado backend:{" "}
        {healthState.status === "loading" && "verificando..."}
        {healthState.status === "ok" && <strong>{healthState.backendStatus}</strong>}
        {healthState.status === "error" && <strong>{healthState.message}</strong>}
      </p>
      <p>
        Swagger: <a href={`${apiBaseUrl}/docs`}>{`${apiBaseUrl}/docs`}</a>
      </p>
    </main>
  );
}

export default App;
