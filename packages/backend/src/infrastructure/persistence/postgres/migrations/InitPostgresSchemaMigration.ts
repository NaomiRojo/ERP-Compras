import type { MigrationInterface, QueryRunner } from "typeorm";

const sqlFiles = [
  "../init/001_extensions.sql",
  "../init/002_schema.sql",
  "../init/003_indexes.sql",
  "../init/004_catalogs.sql",
];

const loadSql = async (relativePath: string): Promise<string> =>
  Bun.file(new URL(relativePath, import.meta.url)).text();

export class InitPostgresSchemaMigration implements MigrationInterface {
  public readonly name = "InitPostgresSchemaMigration1711600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const relativePath of sqlFiles) {
      const sql = (await loadSql(relativePath)).trim();
      if (!sql) {
        continue;
      }

      await queryRunner.query(sql);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS auditoria_eventos CASCADE;
      DROP TABLE IF EXISTS cxp_pagos_proveedor CASCADE;
      DROP TABLE IF EXISTS cxp_cuentas_por_pagar CASCADE;
      DROP TABLE IF EXISTS diario_inventario CASCADE;
      DROP TABLE IF EXISTS compras_detalle CASCADE;
      DROP TABLE IF EXISTS compras_encabezado CASCADE;
      DROP TABLE IF EXISTS o_articulo_almacen CASCADE;
      DROP TABLE IF EXISTS o_articulos CASCADE;
      DROP TABLE IF EXISTS o_proveedores CASCADE;
      DROP TABLE IF EXISTS auth_2fa_codes CASCADE;
      DROP TABLE IF EXISTS auth_refresh_tokens CASCADE;
      DROP TABLE IF EXISTS o_usuarios CASCADE;
      DROP TABLE IF EXISTS o_roles CASCADE;
      DROP TABLE IF EXISTS o_tipos_documento CASCADE;
      DROP TABLE IF EXISTS o_estados_documento CASCADE;
      DROP TABLE IF EXISTS o_grupos_articulo CASCADE;
      DROP TABLE IF EXISTS o_impuestos CASCADE;
      DROP TABLE IF EXISTS o_almacenes CASCADE;
      DROP TABLE IF EXISTS o_monedas CASCADE;
      DROP EXTENSION IF EXISTS pgcrypto;
    `);
  }
}
