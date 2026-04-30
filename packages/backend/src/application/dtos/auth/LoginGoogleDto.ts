import type { LoginSecondFactorOptions } from "src/application/dtos/auth/LoginSecondFactorOptions";

export interface LoginGoogleDto extends LoginSecondFactorOptions {
  credential: string;
}
