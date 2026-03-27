const fromProcessEnv =
  typeof process !== "undefined" ? process.env.BUN_PUBLIC_API_URL : undefined;

export const apiBaseUrl =
  (typeof fromProcessEnv === "string" && fromProcessEnv.trim()) || "http://localhost:4000";
