import { DataSource } from "typeorm";
import { ArticuloEntitySchema } from "src/infrastructure/persistence/postgres/entities/ArticuloEntity";
import { CodigoSegundoFactorEntitySchema } from "src/infrastructure/persistence/postgres/entities/CodigoSegundoFactorEntity";
import { CompraDetalleEntitySchema } from "src/infrastructure/persistence/postgres/entities/CompraDetalleEntity";
import { CompraEncabezadoEntitySchema } from "src/infrastructure/persistence/postgres/entities/CompraEncabezadoEntity";
import { ProveedorEntitySchema } from "src/infrastructure/persistence/postgres/entities/ProveedorEntity";
import { RefreshTokenSesionEntitySchema } from "src/infrastructure/persistence/postgres/entities/RefreshTokenSesionEntity";
import { UsuarioEntitySchema } from "src/infrastructure/persistence/postgres/entities/UsuarioEntity";

const databaseUrl = Bun.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL es obligatorio");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: databaseUrl,
  synchronize: false,
  logging: false,
  entities: [
    ProveedorEntitySchema,
    ArticuloEntitySchema,
    CompraEncabezadoEntitySchema,
    CompraDetalleEntitySchema,
    UsuarioEntitySchema,
    RefreshTokenSesionEntitySchema,
    CodigoSegundoFactorEntitySchema,
  ],
});
