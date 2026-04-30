import { describe, expect, it } from "bun:test";

import { apiBaseUrl, parseSessionIdleTimeoutMinutes, sessionIdleTimeoutMs } from "./config";

describe("config", () => {
  it("parsea el timeout de sesion y usa fallback en valores invalidos", () => {
    expect(parseSessionIdleTimeoutMinutes(undefined)).toBe(15);
    expect(parseSessionIdleTimeoutMinutes("")).toBe(15);
    expect(parseSessionIdleTimeoutMinutes("0")).toBe(15);
    expect(parseSessionIdleTimeoutMinutes("-1")).toBe(15);
    expect(parseSessionIdleTimeoutMinutes("abc")).toBe(15);
    expect(parseSessionIdleTimeoutMinutes("30")).toBe(30);
  });

  it("expone configuracion derivada valida", () => {
    expect(typeof apiBaseUrl).toBe("string");
    expect(apiBaseUrl.length).toBeGreaterThan(0);
    expect(sessionIdleTimeoutMs).toBeGreaterThan(0);
  });
});
