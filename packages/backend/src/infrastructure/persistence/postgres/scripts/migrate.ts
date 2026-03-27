import { createAppDataSource } from "src/infrastructure/persistence/postgres/orm/data-source";

const main = async (): Promise<void> => {
  const dataSource = createAppDataSource();
  await dataSource.initialize();

  try {
    const migrations = await dataSource.runMigrations();
    console.log(`Migraciones ejecutadas: ${migrations.length}`);
    for (const migration of migrations) {
      console.log(`- ${migration.name}`);
    }
  } finally {
    await dataSource.destroy();
  }
};

void main();
