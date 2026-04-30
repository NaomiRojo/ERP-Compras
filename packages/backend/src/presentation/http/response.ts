const CORS_ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"] as const;
const CORS_ALLOWED_HEADERS = ["authorization", "content-type"] as const;
const CORS_MAX_AGE_SECONDS = "600";

const normalizeOrigin = (rawOrigin: string): string | null => {
  try {
    const url = new URL(rawOrigin);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
};

const allowedOrigins = new Set(
  (Bun.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter((origin): origin is string => Boolean(origin)),
);

const allowedRequestMethods = new Set<string>(CORS_ALLOWED_METHODS);
const allowedRequestHeaders = new Set<string>(CORS_ALLOWED_HEADERS);
const corsAllowCredentials = (Bun.env.CORS_ALLOW_CREDENTIALS ?? "false") === "true";

const parseRequestedHeaders = (rawHeaders: string | null): string[] =>
  (rawHeaders ?? "")
    .split(",")
    .map((header) => header.trim().toLowerCase())
    .filter(Boolean);

export const isCorsOriginAllowed = (origin: string | null): boolean => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  return normalizedOrigin !== null && allowedOrigins.has(normalizedOrigin);
};

export const isCorsPreflightAllowed = (request: Request, origin: string | null): boolean => {
  if (!isCorsOriginAllowed(origin)) {
    return false;
  }

  if (!origin) {
    return true;
  }

  const requestedMethod = request.headers.get("access-control-request-method")?.toUpperCase();
  if (!requestedMethod || !allowedRequestMethods.has(requestedMethod)) {
    return false;
  }

  const requestedHeaders = parseRequestedHeaders(
    request.headers.get("access-control-request-headers"),
  );

  return requestedHeaders.every((header) => allowedRequestHeaders.has(header));
};

export const corsHeaders = (origin: string | null): Record<string, string> => {
  const headers: Record<string, string> = {
    "access-control-allow-methods": CORS_ALLOWED_METHODS.join(","),
    "access-control-allow-headers": CORS_ALLOWED_HEADERS.join(","),
    "access-control-max-age": CORS_MAX_AGE_SECONDS,
    vary: "Origin",
  };

  if (!origin) {
    return headers;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  if (normalizedOrigin && allowedOrigins.has(normalizedOrigin)) {
    headers["access-control-allow-origin"] = normalizedOrigin;
    if (corsAllowCredentials) {
      headers["access-control-allow-credentials"] = "true";
    }
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

type BodyValidator<T> = (value: unknown) => T;

export const parseJsonBody = async <T>(
  request: Request,
  validateBody?: BodyValidator<T>,
): Promise<T> => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new Error("Solicitud invalida");
  }

  return validateBody ? validateBody(body) : (body as T);
};
