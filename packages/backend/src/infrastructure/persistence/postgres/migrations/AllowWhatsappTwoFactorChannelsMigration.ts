import type { MigrationInterface, QueryRunner } from "typeorm";

export class AllowWhatsappTwoFactorChannelsMigration implements MigrationInterface {
  public readonly name = "AllowWhatsappTwoFactorChannelsMigration1711800000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE auth_2fa_codes
      DROP CONSTRAINT IF EXISTS chk_auth_2fa_codes_canal;
    `);

    await queryRunner.query(`
      ALTER TABLE auth_2fa_codes
      ADD CONSTRAINT chk_auth_2fa_codes_canal
      CHECK (canal IN ('EMAIL', 'SMS', 'WHATSAPP', 'VOICE', 'APP'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE auth_2fa_codes
      DROP CONSTRAINT IF EXISTS chk_auth_2fa_codes_canal;
    `);

    await queryRunner.query(`
      ALTER TABLE auth_2fa_codes
      ADD CONSTRAINT chk_auth_2fa_codes_canal
      CHECK (canal IN ('EMAIL', 'SMS', 'VOICE', 'APP'));
    `);
  }
}
