import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddSecondFactorDestinationMigration implements MigrationInterface {
  public readonly name = "AddSecondFactorDestinationMigration1711900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE auth_2fa_codes
      ADD COLUMN IF NOT EXISTS destino VARCHAR(255);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE auth_2fa_codes
      DROP COLUMN IF EXISTS destino;
    `);
  }
}
