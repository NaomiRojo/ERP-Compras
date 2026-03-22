import { app } from "./app";
import { AppDataSource } from "src/infrastructure/persistence/postgres/orm/data-source";

const port = Number(Bun.env.PORT ?? 4000);

export const startServer = async (): Promise<void> => {
  await AppDataSource.initialize();

  Bun.serve({
    port,
    fetch: app.fetch,
  });

  console.log(`Backend listening on port ${port}`);
};

void startServer();
