import type { ILogger } from "src/application/interfaces/ILogger";

export class Logger implements ILogger {
  public info(message: string, metadata?: Record<string, unknown>): void {
    console.log(message, metadata ?? {});
  }

  public warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn(message, metadata ?? {});
  }

  public error(message: string, metadata?: Record<string, unknown>): void {
    console.error(message, metadata ?? {});
  }
}
