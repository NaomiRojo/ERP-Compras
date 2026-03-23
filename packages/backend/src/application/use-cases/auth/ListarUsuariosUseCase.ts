import type { Usuario } from "src/domain/entities/Usuario";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";

export class ListarUsuariosUseCase {
  public constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  public async execute(): Promise<Usuario[]> {
    return this.usuarioRepository.findAll();
  }
}
