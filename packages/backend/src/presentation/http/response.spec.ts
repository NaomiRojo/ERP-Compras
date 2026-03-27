import { describe, expect, test } from "bun:test";
import { corsHeaders } from "./response";

describe("corsHeaders", () => {
  test("incluye allow-origin cuando el origen esta permitido", () => {
    const headers = corsHeaders("http://localhost:3000");

    expect(headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect(headers["access-control-allow-credentials"]).toBe("true");
  });

  test("omite allow-origin cuando el origen no esta permitido", () => {
    const headers = corsHeaders("http://evil.local");

    expect(headers["access-control-allow-origin"]).toBeUndefined();
    expect(headers["access-control-allow-methods"]).toBe("GET,POST,PUT,DELETE,OPTIONS");
  });
});
