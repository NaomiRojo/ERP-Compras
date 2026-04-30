import type { LoginSecondFactorOptions } from "src/application/dtos/auth/LoginSecondFactorOptions";

export interface LoginDto extends LoginSecondFactorOptions {
  email: string;
  password: string;
}
