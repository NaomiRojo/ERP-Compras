import type { DataSource } from "typeorm";
import { createApp } from "./app";
import { createContainer } from "./container";
import { createAppDataSource } from "src/infrastructure/persistence/postgres/orm/data-source";

export interface StartServerOptions {
  dataSource?: DataSource;
  port?: number;
}

export const startServer = async (options: StartServerOptions = {}): Promise<void> => {
  const dataSource = options.dataSource ?? createAppDataSource();
  const port = options.port ?? Number(Bun.env.PORT ?? 4000);

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  const app = createApp(createContainer({ dataSource }));

  Bun.serve({
    port,
    fetch: app.fetch,
  });

  console.log(`Backend listening on port ${port}`);
};
