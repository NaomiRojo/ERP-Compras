import { beforeEach, describe, expect, it } from "bun:test";

import { clearSession, loadSession, saveSession } from "./session";

describe("session storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("guarda y recupera la sesion desde localStorage", () => {
    saveSession({
      accessToken: "access-local",
      refreshToken: "refresh-local",
      persistence: "local",
    });

    expect(JSON.parse(window.localStorage.getItem("erp_compras_session") ?? "{}")).toMatchObject({
      accessToken: "access-local",
      refreshToken: "refresh-local",
      persistence: "local",
    });
    expect(window.sessionStorage.getItem("erp_compras_session")).toBeNull();
    expect(loadSession()).toEqual({
      accessToken: "access-local",
      refreshToken: "refresh-local",
      persistence: "local",
    });
  });

  it("guarda y recupera la sesion desde sessionStorage", () => {
    saveSession({
      accessToken: "access-session",
      refreshToken: "refresh-session",
      persistence: "session",
    });

    expect(JSON.parse(window.sessionStorage.getItem("erp_compras_session") ?? "{}")).toMatchObject({
      accessToken: "access-session",
      refreshToken: "refresh-session",
      persistence: "session",
    });
    expect(window.localStorage.getItem("erp_compras_session")).toBeNull();
    expect(loadSession()).toEqual({
      accessToken: "access-session",
      refreshToken: "refresh-session",
      persistence: "session",
    });
  });

  it("ignora sesiones invalidas y cae al storage disponible valido", () => {
    window.localStorage.setItem("erp_compras_session", "{not-json");
    window.sessionStorage.setItem(
      "erp_compras_session",
      JSON.stringify({
        accessToken: "access-fallback",
        refreshToken: "refresh-fallback",
        persistence: "session",
      }),
    );

    expect(loadSession()).toEqual({
      accessToken: "access-fallback",
      refreshToken: "refresh-fallback",
      persistence: "session",
    });
  });

  it("limpia ambos storages al cerrar sesion", () => {
    window.localStorage.setItem(
      "erp_compras_session",
      JSON.stringify({
        accessToken: "access-local",
        refreshToken: "refresh-local",
        persistence: "local",
      }),
    );
    window.sessionStorage.setItem(
      "erp_compras_session",
      JSON.stringify({
        accessToken: "access-session",
        refreshToken: "refresh-session",
        persistence: "session",
      }),
    );

    clearSession();

    expect(window.localStorage.getItem("erp_compras_session")).toBeNull();
    expect(window.sessionStorage.getItem("erp_compras_session")).toBeNull();
    expect(loadSession()).toBeNull();
  });

  it("descarta sesiones sin tokens y usa la persistencia fallback cuando falta el campo", () => {
    window.localStorage.setItem(
      "erp_compras_session",
      JSON.stringify({
        accessToken: "",
        refreshToken: "token",
      }),
    );
    window.sessionStorage.setItem(
      "erp_compras_session",
      JSON.stringify({
        accessToken: "access-session",
        refreshToken: "refresh-session",
      }),
    );

    expect(loadSession()).toEqual({
      accessToken: "access-session",
      refreshToken: "refresh-session",
      persistence: "session",
    });
  });

  it("no opera sobre storage cuando window no esta disponible", () => {
    const originalWindow = globalThis.window;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
    });

    expect(loadSession()).toBeNull();
    expect(() =>
      saveSession({
        accessToken: "access",
        refreshToken: "refresh",
        persistence: "local",
      }),
    ).not.toThrow();
    expect(() => clearSession()).not.toThrow();

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  });
});
