import { describe, expect, test } from "bun:test";
import { corsHeaders, isCorsPreflightAllowed } from "./response";

describe("corsHeaders", () => {
  test("incluye allow-origin cuando el origen esta permitido", () => {
    const headers = corsHeaders("http://localhost:3000");

    expect(headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect(headers["access-control-allow-credentials"]).toBeUndefined();
    expect(headers.vary).toBe("Origin");
    expect(headers["access-control-max-age"]).toBe("600");
  });

  test("omite allow-origin cuando el origen no esta permitido", () => {
    const headers = corsHeaders("http://evil.local");

    expect(headers["access-control-allow-origin"]).toBeUndefined();
    expect(headers["access-control-allow-methods"]).toBe("GET,POST,PUT,DELETE,OPTIONS");
  });
});

describe("isCorsPreflightAllowed", () => {
  test("acepta preflight valido para origen permitido", () => {
    const request = new Request("http://localhost/api/proveedores", {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "GET",
        "access-control-request-headers": "authorization,content-type",
      },
    });

    expect(isCorsPreflightAllowed(request, request.headers.get("origin"))).toBe(true);
  });

  test("rechaza preflight con origen no permitido", () => {
    const request = new Request("http://localhost/api/proveedores", {
      method: "OPTIONS",
      headers: {
        origin: "http://evil.local",
        "access-control-request-method": "GET",
      },
    });

    expect(isCorsPreflightAllowed(request, request.headers.get("origin"))).toBe(false);
  });

  test("rechaza preflight con headers no permitidos", () => {
    const request = new Request("http://localhost/api/proveedores", {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:3000",
        "access-control-request-method": "POST",
        "access-control-request-headers": "x-api-key",
      },
    });

    expect(isCorsPreflightAllowed(request, request.headers.get("origin"))).toBe(false);
  });
});
