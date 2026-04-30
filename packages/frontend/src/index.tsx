/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { App } from "./App";
import { NotificationsProvider } from "./components/Common/Notifications";
import "./styles/globals.css";
import { appTheme } from "./theme";

const elem = document.getElementById("app")!;
const app = (
  <StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <NotificationsProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </NotificationsProvider>
    </ThemeProvider>
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
