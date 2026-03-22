export interface IAuditService {
  record(event: string, payload: Record<string, unknown>): Promise<void>;
}
