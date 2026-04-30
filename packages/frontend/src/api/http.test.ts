import { afterEach, describe, expect, it, mock } from "bun:test";

import { apiBaseUrl } from "../config";
import { ApiError, addRequestInterceptor, apiRequest, setAccessTokenResolver } from "./http";

describe("apiRequest", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    setAccessTokenResolver(null);
  });

  it("inyecta authorization header desde el interceptor de token", async () => {
    const fetchMock = mock(async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;
    setAccessTokenResolver(() => "token-demo");

    const response = await apiRequest<{ ok: boolean }, { nombre: string }>("/api/demo", {
      method: "POST",
      body: { nombre: "ERP Compras" },
    });

    expect(response).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/demo`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ nombre: "ERP Compras" }),
      }),
    );

    const requestInit = (fetchMock.mock.calls as unknown as Array<[string, RequestInit]>)[0]?.[1];
    const headers = new Headers(requestInit?.headers);

    expect(headers.get("authorization")).toBe("Bearer token-demo");
    expect(headers.get("content-type")).toBe("application/json");
  });

  it("omite el header authorization cuando la request deshabilita auth", async () => {
    const fetchMock = mock(async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;
    setAccessTokenResolver(() => "token-demo");

    await apiRequest<{ ok: boolean }>("/api/auth/login", {
      auth: "omit",
      method: "POST",
    });

    const requestInit = (fetchMock.mock.calls as unknown as Array<[string, RequestInit]>)[0]?.[1];
    const headers = new Headers(requestInit?.headers);

    expect(headers.get("authorization")).toBeNull();
  });

  it("permite agregar y remover interceptores personalizados y soporta respuestas 204", async () => {
    const fetchMock = mock(async (url: string) =>
      new Response(null, {
        status: 204,
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const cleanupInterceptor = addRequestInterceptor((request) => ({
      ...request,
      url: `${request.url}?fromInterceptor=1`,
    }));

    const firstResponse = await apiRequest<void>("/api/interceptor");
    cleanupInterceptor();
    const secondResponse = await apiRequest<void>("/api/interceptor");

    expect(firstResponse).toBeUndefined();
    expect(secondResponse).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((fetchMock.mock.calls as unknown as Array<[string]>)[0]?.[0]).toBe(
      `${apiBaseUrl}/api/interceptor?fromInterceptor=1`,
    );
    expect((fetchMock.mock.calls as unknown as Array<[string]>)[1]?.[0]).toBe(
      `${apiBaseUrl}/api/interceptor`,
    );
  });

  it("lanza ApiError con el mensaje del backend cuando la respuesta es JSON", async () => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ message: "Credenciales invalidas" }), {
        status: 401,
        headers: {
          "content-type": "application/json",
        },
      }),
    ) as unknown as typeof fetch;

    try {
      await apiRequest("/api/error");
      throw new Error("La llamada debio fallar");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(401);
      expect((error as ApiError).message).toBe("Credenciales invalidas");
    }
  });

  it("usa el mensaje fallback cuando la respuesta no trae JSON valido", async () => {
    const invalidJsonFetch = mock(async () =>
      new Response("{", {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    globalThis.fetch = invalidJsonFetch as unknown as typeof fetch;

    try {
      await apiRequest("/api/error-json");
      throw new Error("La llamada debio fallar");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(500);
      expect((error as ApiError).message).toBe("Error HTTP 500");
    }

    globalThis.fetch = mock(async () =>
      new Response("texto plano", {
        status: 502,
        headers: {
          "content-type": "text/plain",
        },
      }),
    ) as unknown as typeof fetch;

    try {
      await apiRequest("/api/error-text");
      throw new Error("La llamada debio fallar");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(502);
      expect((error as ApiError).message).toBe("Error HTTP 502");
    }
  });

  it("devuelve null cuando la respuesta dice JSON pero el cuerpo no se puede parsear", async () => {
    globalThis.fetch = mock(async () =>
      new Response("{", {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }),
    ) as unknown as typeof fetch;

    const payload = await apiRequest<null>("/api/payload-invalido");

    expect(payload).toBeNull();
  });
});
