import type { DataSource, EntityManager, EntitySchema, ObjectLiteral, QueryRunner, Repository } from "typeorm";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";

export class TypeOrmUnitOfWork implements IUnitOfWork {
  private queryRunner: QueryRunner | null = null;

  public constructor(private readonly dataSource: DataSource) {}

  public async start(): Promise<void> {
    if (this.queryRunner) {
      return;
    }

    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  public async commit(): Promise<void> {
    if (this.queryRunner) {
      await this.queryRunner.commitTransaction();
    }
  }

  public async rollback(): Promise<void> {
    if (this.queryRunner && this.queryRunner.isTransactionActive) {
      await this.queryRunner.rollbackTransaction();
    }
  }

  public async release(): Promise<void> {
    if (!this.queryRunner) {
      return;
    }

    await this.queryRunner.release();
    this.queryRunner = null;
  }

  public getRepository<T extends ObjectLiteral>(target: EntitySchema<T>): Repository<T> {
    return this.manager.getRepository(target);
  }

  public getEntityManager(): EntityManager {
    return this.manager;
  }

  private get manager(): EntityManager {
    return this.queryRunner ? this.queryRunner.manager : this.dataSource.manager;
  }
}
