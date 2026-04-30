import { apiBaseUrl } from "../config";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOptions<TBody> = {
  method?: HttpMethod;
  body?: TBody;
  accessToken?: string;
  auth?: "auto" | "omit";
  signal?: AbortSignal;
};

type InterceptorRequest = {
  url: string;
  method: HttpMethod;
  headers: Headers;
  body?: string;
  accessToken?: string;
  auth: "auto" | "omit";
  signal?: AbortSignal;
};

type RequestInterceptor = (
  request: InterceptorRequest,
) => InterceptorRequest | Promise<InterceptorRequest>;

type ErrorBody = {
  message?: string;
};

export class ApiError extends Error {
  public readonly status: number;

  public constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let accessTokenResolver: (() => string | null | undefined) | null = null;
const requestInterceptors = new Set<RequestInterceptor>();

export const setAccessTokenResolver = (
  resolver: (() => string | null | undefined) | null,
): void => {
  accessTokenResolver = resolver;
};

export const addRequestInterceptor = (interceptor: RequestInterceptor): (() => void) => {
  requestInterceptors.add(interceptor);

  return () => {
    requestInterceptors.delete(interceptor);
  };
};

const resolveErrorMessage = (fallback: string, payload: unknown): string => {
  if (typeof payload === "object" && payload !== null && "message" in payload) {
    const message = (payload as ErrorBody).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
};

const maybeParseJson = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

addRequestInterceptor((request) => {
  if (request.auth === "omit") {
    return request;
  }

  const token = request.accessToken ?? accessTokenResolver?.();
  if (!token) {
    return request;
  }

  const headers = new Headers(request.headers);
  headers.set("authorization", `Bearer ${token}`);

  return {
    ...request,
    headers,
  };
});

export async function apiRequest<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const method = options.method ?? "GET";
  let request: InterceptorRequest = {
    url: `${apiBaseUrl}${path}`,
    method,
    headers: new Headers(),
    accessToken: options.accessToken,
    auth: options.auth ?? "auto",
    signal: options.signal,
  };

  if (options.body !== undefined) {
    request.headers.set("content-type", "application/json");
    request = {
      ...request,
      body: JSON.stringify(options.body),
    };
  }

  for (const interceptor of requestInterceptors) {
    request = await interceptor(request);
  }

  const response = await fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    signal: request.signal,
  });

  const payload = await maybeParseJson(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      resolveErrorMessage(`Error HTTP ${response.status}`, payload),
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return payload as TResponse;
}
