import type { AuditoriaEvento } from "src/domain/entities/AuditoriaEvento";

export interface IAuditoriaEventoRepository {
  findById(id: string): Promise<AuditoriaEvento | null>;
  listAll(): Promise<AuditoriaEvento[]>;
  save(evento: AuditoriaEvento): Promise<void>;
}
