import { describe, expect, test } from "bun:test";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import type { HttpDependencies } from "src/presentation/http/dependencies";
import { createAuthRouteHandler } from "./authHandlers";

const tokenService: ITokenService = {
  async sign() {
    return "token";
  },
  async verify() {
    return {};
  },
};

const createDependencies = (message: string): Pick<
  HttpDependencies,
  "createAuthContext" | "tokenService"
> => ({
  tokenService,
  createAuthContext() {
    return {
      listarUsuariosUseCase: {
        async execute() {
          return [];
        },
      },
      obtenerUsuarioActualUseCase: {
        async execute() {
          throw new Error("Not implemented");
        },
      },
      registerUsuarioUseCase: {
        async execute() {
          throw new Error("Not implemented");
        },
      },
      loginUsuarioUseCase: {
        async execute() {
          throw new Error("Not implemented");
        },
      },
      loginGoogleUseCase: {
        async execute() {
          throw new Error("Not implemented");
        },
      },
      verifySegundoFactorUseCase: {
        async execute() {
          throw new Error(message);
        },
        async resend() {
          throw new Error(message);
        },
        async refresh() {
          throw new Error(message);
        },
      },
    };
  },
});

const createJsonRequest = (url: string, body: unknown): Request =>
  new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

describe("createAuthRouteHandler", () => {
  test("devuelve 410 cuando el codigo 2FA expiro", async () => {
    const handler = createAuthRouteHandler(createDependencies("El codigo de segundo factor expiro"));

    const response = await handler(
      createJsonRequest("http://localhost:4000/api/auth/verify-2fa", {
        challengeId: "challenge-1",
        code: "123456",
      }),
      "/api/auth/verify-2fa",
      null,
    );

    expect(response?.status).toBe(410);
  });

  test("devuelve 404 cuando el usuario del challenge no esta disponible", async () => {
    const handler = createAuthRouteHandler(createDependencies("Usuario no disponible"));

    const response = await handler(
      createJsonRequest("http://localhost:4000/api/auth/verify-2fa", {
        challengeId: "challenge-1",
        code: "123456",
      }),
      "/api/auth/verify-2fa",
      null,
    );

    expect(response?.status).toBe(404);
  });

  test("devuelve 400 cuando falta challengeId o code", async () => {
    const handler = createAuthRouteHandler(createDependencies("challengeId y code son obligatorios"));

    const response = await handler(
      createJsonRequest("http://localhost:4000/api/auth/verify-2fa", {
        challengeId: "",
        code: "",
      }),
      "/api/auth/verify-2fa",
      null,
    );

    expect(response?.status).toBe(400);
  });

  test("devuelve 400 cuando falta challengeId al reenviar 2FA", async () => {
    const handler = createAuthRouteHandler(createDependencies("challengeId es obligatorio"));

    const response = await handler(
      createJsonRequest("http://localhost:4000/api/auth/resend-2fa", {
        challengeId: "",
      }),
      "/api/auth/resend-2fa",
      null,
    );

    expect(response?.status).toBe(400);
  });

  test("devuelve 401 cuando el refresh token no es valido", async () => {
    const handler = createAuthRouteHandler(createDependencies("Refresh token invalido"));

    const response = await handler(
      createJsonRequest("http://localhost:4000/api/auth/refresh", {
        refreshToken: "invalid",
      }),
      "/api/auth/refresh",
      null,
    );

    expect(response?.status).toBe(401);
  });

  test("devuelve 503 cuando el canal 2FA no esta configurado", async () => {
    const handler = createAuthRouteHandler(
      createDependencies("El segundo factor por SMS no esta configurado"),
    );

    const response = await handler(
      createJsonRequest("http://localhost:4000/api/auth/verify-2fa", {
        challengeId: "challenge-1",
        code: "123456",
      }),
      "/api/auth/verify-2fa",
      null,
    );

    expect(response?.status).toBe(503);
  });
});
