import { createAppDataSource } from "src/infrastructure/persistence/postgres/orm/data-source";

const requiredTables = [
  "o_usuarios",
  "o_proveedores",
  "o_articulos",
  "compras_encabezado",
  "compras_detalle",
  "auth_refresh_tokens",
  "auth_2fa_codes",
];

const main = async (): Promise<void> => {
  const dataSource = createAppDataSource();
  await dataSource.initialize();

  try {
    const missing: string[] = [];

    for (const tableName of requiredTables) {
      const rows = await dataSource.query(
        `
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = $1
        `,
        [tableName],
      );

      if (rows.length === 0) {
        missing.push(tableName);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Faltan tablas requeridas: ${missing.join(", ")}`);
    }

    const [users] = await dataSource.query("SELECT COUNT(*)::int AS count FROM o_usuarios");
    const [proveedores] = await dataSource.query("SELECT COUNT(*)::int AS count FROM o_proveedores");
    const [articulos] = await dataSource.query("SELECT COUNT(*)::int AS count FROM o_articulos");

    console.log("Smoke OK");
    console.log(`Usuarios: ${users?.count ?? 0}`);
    console.log(`Proveedores: ${proveedores?.count ?? 0}`);
    console.log(`Articulos: ${articulos?.count ?? 0}`);
  } finally {
    await dataSource.destroy();
  }
};

void main();
