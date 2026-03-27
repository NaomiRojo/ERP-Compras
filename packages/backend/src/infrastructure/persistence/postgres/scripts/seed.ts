import type { DataSource } from "typeorm";
import { createAppDataSource } from "src/infrastructure/persistence/postgres/orm/data-source";

const demoUsers = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    username: Bun.env.DEMO_USER_USERNAME?.trim() || "admin",
    nombreCompleto: Bun.env.DEMO_USER_NAME?.trim() || "Administrador ERP",
    email: Bun.env.DEMO_USER_EMAIL?.trim() || "admin@erp.local",
    password: Bun.env.DEMO_USER_PASSWORD?.trim() || "Admin123*",
    rolId: Number(Bun.env.DEMO_USER_ROLE_ID ?? 1),
    twoFactorEnabled: (Bun.env.DEMO_USER_2FA_ENABLED ?? "true") === "true",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    username: "compras",
    nombreCompleto: "Operador Compras ERP",
    email: "compras@erp.local",
    password: "Compras123*",
    rolId: 2,
    twoFactorEnabled: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    username: "almacen",
    nombreCompleto: "Operador Almacen ERP",
    email: "almacen@erp.local",
    password: "Almacen123*",
    rolId: 3,
    twoFactorEnabled: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    username: "supervisor",
    nombreCompleto: "Supervisor Compras ERP",
    email: "supervisor@erp.local",
    password: "Supervisor123*",
    rolId: 4,
    twoFactorEnabled: true,
  },
];

const demoProveedor = {
  id: "00000000-0000-0000-0000-000000000101",
  cardCode: "PRV-DEMO-001",
  cardName: "Proveedor Demo ERP",
  nitRut: "123456701",
  email: "proveedor.demo@erp.local",
  telefono: "70000001",
  direccion: "Zona Demo, ERP",
  monedaId: 1,
};

const demoArticulo = {
  id: "00000000-0000-0000-0000-000000000201",
  itemCode: "ITEM-DEMO-001",
  itemName: "Articulo Demo ERP",
  descripcion: "Articulo semilla para pruebas en Postman",
  unidadMedida: "UNI",
  costoEstandar: "100.0000",
  grupoId: 1,
  impuestoId: 1,
};

const seedUsuario = async (
  dataSource: DataSource,
  demoUser: (typeof demoUsers)[number],
): Promise<void> => {
  const passwordHash = await Bun.password.hash(demoUser.password);
  const existing = await dataSource.query(
    "SELECT id FROM o_usuarios WHERE username = $1 OR email = $2 LIMIT 1",
    [demoUser.username, demoUser.email],
  );

  if (existing[0]?.id) {
    await dataSource.query(
      `
        UPDATE o_usuarios
        SET username = $2,
            nombre_completo = $3,
            email = $4,
            password_hash = $5,
            rol_id = $6,
            activo = TRUE,
            two_factor_enabled = $7,
            updated_at = NOW()
        WHERE id = $1
      `,
      [
        existing[0].id,
        demoUser.username,
        demoUser.nombreCompleto,
        demoUser.email,
        passwordHash,
        demoUser.rolId,
        demoUser.twoFactorEnabled,
      ],
    );
    return;
  }

  await dataSource.query(
    `
      INSERT INTO o_usuarios (
        id,
        username,
        nombre_completo,
        email,
        password_hash,
        rol_id,
        activo,
        two_factor_enabled
      )
      VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7)
    `,
    [
      demoUser.id,
      demoUser.username,
      demoUser.nombreCompleto,
      demoUser.email,
      passwordHash,
      demoUser.rolId,
      demoUser.twoFactorEnabled,
    ],
  );
};

const seedProveedor = async (dataSource: DataSource): Promise<void> => {
  await dataSource.query(
    `
      INSERT INTO o_proveedores (
        id,
        card_code,
        card_name,
        nit_rut,
        email,
        telefono,
        direccion,
        moneda_id,
        balance_cuenta,
        linea_credito,
        activo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, 1000, TRUE)
      ON CONFLICT (card_code)
      DO UPDATE SET
        card_name = EXCLUDED.card_name,
        nit_rut = EXCLUDED.nit_rut,
        email = EXCLUDED.email,
        telefono = EXCLUDED.telefono,
        direccion = EXCLUDED.direccion,
        moneda_id = EXCLUDED.moneda_id,
        linea_credito = EXCLUDED.linea_credito,
        updated_at = NOW()
    `,
    [
      demoProveedor.id,
      demoProveedor.cardCode,
      demoProveedor.cardName,
      demoProveedor.nitRut,
      demoProveedor.email,
      demoProveedor.telefono,
      demoProveedor.direccion,
      demoProveedor.monedaId,
    ],
  );
};

const seedArticulo = async (dataSource: DataSource): Promise<void> => {
  await dataSource.query(
    `
      INSERT INTO o_articulos (
        id,
        item_code,
        item_name,
        descripcion,
        unidad_medida,
        costo_estandar,
        grupo_id,
        impuesto_id,
        activo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      ON CONFLICT (item_code)
      DO UPDATE SET
        item_name = EXCLUDED.item_name,
        descripcion = EXCLUDED.descripcion,
        unidad_medida = EXCLUDED.unidad_medida,
        costo_estandar = EXCLUDED.costo_estandar,
        grupo_id = EXCLUDED.grupo_id,
        impuesto_id = EXCLUDED.impuesto_id,
        updated_at = NOW()
    `,
    [
      demoArticulo.id,
      demoArticulo.itemCode,
      demoArticulo.itemName,
      demoArticulo.descripcion,
      demoArticulo.unidadMedida,
      demoArticulo.costoEstandar,
      demoArticulo.grupoId,
      demoArticulo.impuestoId,
    ],
  );
};

const main = async (): Promise<void> => {
  const dataSource = createAppDataSource();
  await dataSource.initialize();

  try {
    for (const demoUser of demoUsers) {
      await seedUsuario(dataSource, demoUser);
    }
    await seedProveedor(dataSource);
    await seedArticulo(dataSource);
    console.log("Seed de demo aplicado");
    for (const demoUser of demoUsers) {
      console.log(`Usuario demo: ${demoUser.email} / ${demoUser.password}`);
    }
  } finally {
    await dataSource.destroy();
  }
};

void main();
