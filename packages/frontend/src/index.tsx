/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import { App } from "./App";
import { AppErrorBoundary } from "./components/App/AppErrorBoundary";
import { ColorModeProvider } from "./components/Common/ColorMode";
import { NotificationsProvider } from "./components/Common/Notifications";
import "./styles/globals.css";

const elem = document.getElementById("app")!;
const app = (
  <StrictMode>
    <AppErrorBoundary>
      <ColorModeProvider>
        <NotificationsProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </NotificationsProvider>
      </ColorModeProvider>
    </AppErrorBoundary>
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
