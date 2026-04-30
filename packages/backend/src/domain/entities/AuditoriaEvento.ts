export interface AuditoriaEventoProps {
  id: string;
  usuarioId: string;
  entidad: string;
  entidadId?: string;
  accion: string;
  datosAntes?: Record<string, unknown>;
  datosDespues?: Record<string, unknown>;
  ipOrigen?: string;
  fecha: Date;
}

export class AuditoriaEvento {
  public constructor(public readonly props: AuditoriaEventoProps) {}
}

export interface CreateAuditoriaEventoInput {
  usuarioId: string;
  entidad: string;
  entidadId?: string;
  accion: string;
  datosAntes?: Record<string, unknown>;
  datosDespues?: Record<string, unknown>;
  ipOrigen?: string;
}

export const createAuditoriaEvento = (
  input: CreateAuditoriaEventoInput,
): AuditoriaEvento =>
  new AuditoriaEvento({
    id: crypto.randomUUID(),
    usuarioId: input.usuarioId,
    entidad: input.entidad,
    entidadId: input.entidadId,
    accion: input.accion,
    datosAntes: input.datosAntes,
    datosDespues: input.datosDespues,
    ipOrigen: input.ipOrigen,
    fecha: new Date(),
  });
