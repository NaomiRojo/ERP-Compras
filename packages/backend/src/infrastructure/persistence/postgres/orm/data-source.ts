import { DataSource } from "typeorm";
import { ArticuloEntitySchema } from "src/infrastructure/persistence/postgres/entities/ArticuloEntity";
import { CodigoSegundoFactorEntitySchema } from "src/infrastructure/persistence/postgres/entities/CodigoSegundoFactorEntity";
import { CompraDetalleEntitySchema } from "src/infrastructure/persistence/postgres/entities/CompraDetalleEntity";
import { CompraEncabezadoEntitySchema } from "src/infrastructure/persistence/postgres/entities/CompraEncabezadoEntity";
import { AddSecondFactorDestinationMigration } from "src/infrastructure/persistence/postgres/migrations/AddSecondFactorDestinationMigration";
import { AllowWhatsappTwoFactorChannelsMigration } from "src/infrastructure/persistence/postgres/migrations/AllowWhatsappTwoFactorChannelsMigration";
import { ProveedorEntitySchema } from "src/infrastructure/persistence/postgres/entities/ProveedorEntity";
import { RefreshTokenSesionEntitySchema } from "src/infrastructure/persistence/postgres/entities/RefreshTokenSesionEntity";
import { UsuarioEntitySchema } from "src/infrastructure/persistence/postgres/entities/UsuarioEntity";
import { ExpandTwoFactorChannelsMigration } from "src/infrastructure/persistence/postgres/migrations/ExpandTwoFactorChannelsMigration";
import { InitPostgresSchemaMigration } from "src/infrastructure/persistence/postgres/migrations/InitPostgresSchemaMigration";

const entities = [
  ProveedorEntitySchema,
  ArticuloEntitySchema,
  CompraEncabezadoEntitySchema,
  CompraDetalleEntitySchema,
  UsuarioEntitySchema,
  RefreshTokenSesionEntitySchema,
  CodigoSegundoFactorEntitySchema,
];

export const resolveDatabaseUrl = (): string => {
  const databaseUrl = Bun.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL es obligatorio");
  }

  return databaseUrl;
};

export const createAppDataSource = (): DataSource =>
  new DataSource({
    type: "postgres",
    url: resolveDatabaseUrl(),
    synchronize: false,
    logging: false,
    migrationsTableName: "typeorm_migrations",
    entities,
    migrations: [
      InitPostgresSchemaMigration,
      ExpandTwoFactorChannelsMigration,
      AllowWhatsappTwoFactorChannelsMigration,
      AddSecondFactorDestinationMigration,
    ],
  });
