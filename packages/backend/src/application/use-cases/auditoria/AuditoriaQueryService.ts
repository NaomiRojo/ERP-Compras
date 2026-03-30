import type { AuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import type { IAuditoriaEventoRepository } from "src/domain/repositories/IAuditoriaEventoRepository";

export class AuditoriaQueryService {
  public constructor(private readonly auditoriaEventoRepository: IAuditoriaEventoRepository) {}

  public listarEventos(): Promise<AuditoriaEvento[]> {
    return this.auditoriaEventoRepository.listAll();
  }

  public async obtenerEvento(id: string): Promise<AuditoriaEvento> {
    const eventoId = id.trim();
    if (!eventoId) {
      throw new Error("id es obligatorio");
    }

    const evento = await this.auditoriaEventoRepository.findById(eventoId);
    if (!evento) {
      throw new Error("Evento de auditoria no encontrado");
    }

    return evento;
  }
}
