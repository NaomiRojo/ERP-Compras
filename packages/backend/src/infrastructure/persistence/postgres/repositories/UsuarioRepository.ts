import type { Repository } from "typeorm";
import { Usuario } from "src/domain/entities/Usuario";
import type { IUsuarioRepository } from "src/domain/repositories/IUsuarioRepository";
import { UsuarioEntitySchema, type UsuarioRow } from "src/infrastructure/persistence/postgres/entities/UsuarioEntity";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

const toDomain = (row: UsuarioRow): Usuario =>
  new Usuario({
    id: row.id,
    username: row.username,
    nombreCompleto: row.nombreCompleto,
    email: row.email,
    passwordHash: row.passwordHash,
    googleSub: row.googleSub ?? undefined,
    rolId: row.rolId,
    activo: row.activo,
    twoFactorEnabled: row.twoFactorEnabled,
    twoFactorSecret: row.twoFactorSecret ?? undefined,
  });

const toRow = (usuario: Usuario): Partial<UsuarioRow> => ({
  id: usuario.props.id,
  username: usuario.props.username,
  nombreCompleto: usuario.props.nombreCompleto,
  email: usuario.props.email,
  passwordHash: usuario.props.passwordHash,
  googleSub: usuario.props.googleSub ?? null,
  rolId: usuario.props.rolId,
  activo: usuario.props.activo,
  twoFactorEnabled: usuario.props.twoFactorEnabled,
  twoFactorSecret: usuario.props.twoFactorSecret ?? null,
});

export class UsuarioRepository implements IUsuarioRepository {
  public constructor(private readonly unitOfWork: TypeOrmUnitOfWork) {}

  public async save(usuario: Usuario): Promise<void> {
    await this.repository().save(toRow(usuario));
  }

  public async findAll(): Promise<Usuario[]> {
    const rows = await this.repository().find({
      order: {
        username: "ASC",
      },
    });

    return rows.map(toDomain);
  }

  public async findById(id: string): Promise<Usuario | null> {
    const row = await this.repository().findOneBy({ id });
    return row ? toDomain(row) : null;
  }

  public async findByEmail(email: string): Promise<Usuario | null> {
    const row = await this.repository().findOneBy({ email });
    return row ? toDomain(row) : null;
  }

  public async findByGoogleSub(googleSub: string): Promise<Usuario | null> {
    const row = await this.repository().findOneBy({ googleSub });
    return row ? toDomain(row) : null;
  }

  public async findByUsername(username: string): Promise<Usuario | null> {
    const row = await this.repository().findOneBy({ username });
    return row ? toDomain(row) : null;
  }

  private repository(): Repository<UsuarioRow> {
    return this.unitOfWork.getRepository(UsuarioEntitySchema);
  }
}
