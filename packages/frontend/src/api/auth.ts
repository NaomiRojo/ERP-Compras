import type {
  AuthLoginResponse,
  AuthTokensResponse,
  ResendTwoFactorResponse,
  UsuarioApi,
} from "../types/api";
import { apiRequest } from "./http";

type RegisterUsuarioDto = {
  username: string;
  nombreCompleto: string;
  email: string;
  password: string;
  rolId?: number;
  twoFactorEnabled?: boolean;
};

type RegisterUsuarioResponse = {
  id: string;
  username: string;
  email: string;
  rolId: number;
};

type LoginDto = {
  email: string;
  password: string;
  twoFactorChannel?: "EMAIL" | "SMS" | "WHATSAPP" | "VOICE";
  twoFactorPhoneNumber?: string;
};

type VerifyTwoFactorDto = {
  challengeId: string;
  code: string;
};

type RefreshTokenDto = {
  refreshToken: string;
};

type ResendTwoFactorDto = {
  challengeId: string;
};

export const authApi = {
  register: (dto: RegisterUsuarioDto) =>
    apiRequest<RegisterUsuarioResponse, RegisterUsuarioDto>("/api/auth/register", {
      auth: "omit",
      method: "POST",
      body: dto,
    }),

  login: (dto: LoginDto) =>
    apiRequest<AuthLoginResponse, LoginDto>("/api/auth/login", {
      auth: "omit",
      method: "POST",
      body: dto,
    }),

  verifyTwoFactor: (dto: VerifyTwoFactorDto) =>
    apiRequest<AuthTokensResponse, VerifyTwoFactorDto>("/api/auth/verify-2fa", {
      auth: "omit",
      method: "POST",
      body: dto,
    }),

  resendTwoFactor: (dto: ResendTwoFactorDto) =>
    apiRequest<ResendTwoFactorResponse, ResendTwoFactorDto>("/api/auth/resend-2fa", {
      auth: "omit",
      method: "POST",
      body: dto,
    }),

  refresh: (dto: RefreshTokenDto) =>
    apiRequest<AuthTokensResponse, RefreshTokenDto>("/api/auth/refresh", {
      auth: "omit",
      method: "POST",
      body: dto,
    }),

  me: (accessToken?: string) =>
    apiRequest<UsuarioApi>("/api/auth/me", {
      accessToken,
    }),
};

export type AuthService = typeof authApi;
export const authService: AuthService = authApi;
