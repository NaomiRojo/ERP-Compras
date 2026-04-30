import type { IPasswordService } from "src/application/interfaces/IPasswordService";

export class PasswordService implements IPasswordService {
  public async hash(password: string): Promise<string> {
    return Bun.password.hash(password);
  }

  public async verify(password: string, hash: string): Promise<boolean> {
    return Bun.password.verify(password, hash);
  }
}
