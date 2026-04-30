import type { Usuario } from "src/domain/entities/Usuario";

export interface IUsuarioRepository {
  save(usuario: Usuario): Promise<void>;
  findAll(): Promise<Usuario[]>;
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findByGoogleSub(googleSub: string): Promise<Usuario | null>;
  findByUsername(username: string): Promise<Usuario | null>;
}
