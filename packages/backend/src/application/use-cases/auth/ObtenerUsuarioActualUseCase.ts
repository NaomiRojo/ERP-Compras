import type { Usuario } from "src/domain/entities/Usuario";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";

export class ObtenerUsuarioActualUseCase {
  public constructor(private readonly usuarioRepository: IUsuarioRepository) {}

  public async execute(userId: string): Promise<Usuario> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new Error("userId es obligatorio");
    }

    const usuario = await this.usuarioRepository.findById(normalizedUserId);
    if (!usuario || !usuario.props.activo) {
      throw new Error("Usuario no encontrado");
    }

    return usuario;
  }
}
