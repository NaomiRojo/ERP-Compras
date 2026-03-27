const allowedOrigins = (Bun.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsHeaders = (origin: string | null): Record<string, string> => {
  const headers: Record<string, string> = {
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-allow-credentials": "true",
    vary: "origin",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["access-control-allow-origin"] = origin;
  }

  return headers;
};

export const json = (body: unknown, status = 200, origin: string | null = null): Response =>
  Response.json(body, {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(origin),
    },
  });

export const noContent = (origin: string | null = null): Response =>
  new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });

export const parseJsonBody = async <T>(request: Request): Promise<T> => {
  const body = (await request.json()) as T;
  return body;
};
