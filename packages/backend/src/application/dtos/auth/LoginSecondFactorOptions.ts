import type { SegundoFactorCanalEntrega } from "src/domain/entities/SegundoFactorCanal";

export interface LoginSecondFactorOptions {
  twoFactorChannel?: SegundoFactorCanalEntrega;
  twoFactorPhoneNumber?: string;
}
