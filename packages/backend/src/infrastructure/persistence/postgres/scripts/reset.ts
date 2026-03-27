import { createAppDataSource } from "src/infrastructure/persistence/postgres/orm/data-source";

const main = async (): Promise<void> => {
  const dataSource = createAppDataSource();
  await dataSource.initialize();

  try {
    await dataSource.query("DROP SCHEMA IF EXISTS public CASCADE");
    await dataSource.query("CREATE SCHEMA public");
    await dataSource.query("GRANT ALL ON SCHEMA public TO CURRENT_USER");
    console.log("Esquema public reiniciado");
  } finally {
    await dataSource.destroy();
  }
};

void main();
