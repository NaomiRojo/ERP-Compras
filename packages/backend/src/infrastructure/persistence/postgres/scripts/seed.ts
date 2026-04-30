import type { DataSource } from "typeorm";
import { createAppDataSource } from "src/infrastructure/persistence/postgres/orm/data-source";

type IdRow = {
  id: string;
};

type DemoUser = {
  id: string;
  username: string;
  nombreCompleto: string;
  email: string;
  password: string;
  rolId: number;
  twoFactorEnabled: boolean;
};

type DemoProveedor = {
  id: string;
  cardCode: string;
  cardName: string;
  nombreComercial?: string;
  nitRut: string;
  email: string;
  telefono: string;
  direccion: string;
  monedaId: number;
  lineaCredito: number;
};

type DemoArticulo = {
  id: string;
  itemCode: string;
  itemName: string;
  descripcion: string;
  unidadMedida: string;
  costoEstandar: number;
  grupoId: number;
  impuestoId: number;
};

type DemoOrdenLinea = {
  id: string;
  itemCode: string;
  almacenId: string;
  cantidadTotal: number;
  cantidadPendiente: number;
  precioUnitario: number;
  descuentoLinea?: number;
};

type DemoOrden = {
  id: string;
  tipoDocId: number;
  docNum: number;
  proveedorCode: string;
  estadoId: number;
  monedaId: number;
  fechaDocumento: string;
  fechaVencimiento?: string;
  comentarios: string;
  createdByEmail: string;
  approvedByEmail?: string;
  lineas: DemoOrdenLinea[];
};

type DemoCuentaPorPagar = {
  id: string;
  ordenDocNum: number;
  proveedorCode: string;
  numeroFactura: string;
  saldoRatio: number;
  fechaVencimiento: string;
  estado: "PENDIENTE" | "PARCIAL" | "PAGADA";
};

type DemoPago = {
  id: string;
  cuentaId: string;
  referencia: string;
  fechaPago: string;
  createdByEmail: string;
};

type DemoStock = {
  id: string;
  itemCode: string;
  almacenId: string;
  stockFisico: number;
  comprometido: number;
  solicitado: number;
};

type DemoMovimiento = {
  id: string;
  itemCode: string;
  almacenId: string;
  ordenDocNum: number;
  tipoMovimiento: "IN" | "OUT";
  cantidad: number;
  costoMomento: number;
  usuarioEmail: string;
  fecha: string;
  comentario: string;
};

type DemoAuditoria = {
  id: string;
  usuarioEmail: string;
  entidad: string;
  entidadIdCode?: string;
  accion: string;
  datosAntes?: Record<string, unknown>;
  datosDespues?: Record<string, unknown>;
  ipOrigen: string;
  fecha: string;
};

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
] satisfies DemoUser[];

const demoProveedores = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    cardCode: "PRV-DEMO-001",
    cardName: "Proveedor Demo ERP",
    nombreComercial: "Demo ERP",
    nitRut: "123456701",
    email: "proveedor.demo@erp.local",
    telefono: "70000001",
    direccion: "Zona Demo, ERP",
    monedaId: 1,
    lineaCredito: 40000,
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    cardCode: "PRV-ACERO",
    cardName: "Aceros Andinos SRL",
    nombreComercial: "Aceros Andinos",
    nitRut: "457812301",
    email: "ventas@aceros-andinos.local",
    telefono: "70000002",
    direccion: "Parque industrial, Santa Cruz",
    monedaId: 1,
    lineaCredito: 120000,
  },
  {
    id: "00000000-0000-0000-0000-000000000103",
    cardCode: "PRV-ELECTRO",
    cardName: "Electro Norte Importaciones",
    nombreComercial: "Electro Norte",
    nitRut: "559901203",
    email: "compras@electronorte.local",
    telefono: "70000003",
    direccion: "Av. Industrial 320",
    monedaId: 2,
    lineaCredito: 90000,
  },
  {
    id: "00000000-0000-0000-0000-000000000104",
    cardCode: "PRV-LOG",
    cardName: "Logistica Integral Bolivia",
    nombreComercial: "LIBO",
    nitRut: "610045872",
    email: "operaciones@libo.local",
    telefono: "70000004",
    direccion: "Zona franca, El Alto",
    monedaId: 1,
    lineaCredito: 75000,
  },
  {
    id: "00000000-0000-0000-0000-000000000105",
    cardCode: "PRV-QUIM",
    cardName: "Quimicos del Sur SA",
    nombreComercial: "QuimSur",
    nitRut: "722301456",
    email: "atencion@quimsur.local",
    telefono: "70000005",
    direccion: "Av. Petrolera 915",
    monedaId: 1,
    lineaCredito: 65000,
  },
  {
    id: "00000000-0000-0000-0000-000000000106",
    cardCode: "PRV-OFI",
    cardName: "OfiMarket Mayorista",
    nombreComercial: "OfiMarket",
    nitRut: "889001234",
    email: "ventas@ofimarket.local",
    telefono: "70000006",
    direccion: "Calle Comercio 140",
    monedaId: 1,
    lineaCredito: 30000,
  },
] satisfies DemoProveedor[];

const demoArticulos = [
  {
    id: "00000000-0000-0000-0000-000000000201",
    itemCode: "ITEM-DEMO-001",
    itemName: "Articulo Demo ERP",
    descripcion: "Articulo semilla para pruebas en Postman",
    unidadMedida: "UNI",
    costoEstandar: 100,
    grupoId: 1,
    impuestoId: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000202",
    itemCode: "MAT-ACERO-01",
    itemName: "Plancha de acero 2mm",
    descripcion: "Material para mantenimiento y fabricacion interna",
    unidadMedida: "PZA",
    costoEstandar: 420,
    grupoId: 1,
    impuestoId: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000203",
    itemCode: "ELEC-CABLE-01",
    itemName: "Cable industrial 3x10",
    descripcion: "Cableado electrico para lineas de planta",
    unidadMedida: "M",
    costoEstandar: 38,
    grupoId: 2,
    impuestoId: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000204",
    itemCode: "INS-GUANTE-01",
    itemName: "Guante nitrilo industrial",
    descripcion: "Insumo de seguridad para almacen y planta",
    unidadMedida: "CAJ",
    costoEstandar: 95,
    grupoId: 2,
    impuestoId: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000205",
    itemCode: "REP-MOTOR-01",
    itemName: "Motor reductor 2HP",
    descripcion: "Repuesto critico para equipos de produccion",
    unidadMedida: "UNI",
    costoEstandar: 1850,
    grupoId: 3,
    impuestoId: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000206",
    itemCode: "INS-CAJA-01",
    itemName: "Caja corrugada reforzada",
    descripcion: "Empaque para despacho y almacenaje",
    unidadMedida: "PZA",
    costoEstandar: 12,
    grupoId: 2,
    impuestoId: 1,
  },
] satisfies DemoArticulo[];

const demoOrdenes = [
  {
    id: "00000000-0000-0000-0000-000000000301",
    tipoDocId: 2,
    docNum: 6101,
    proveedorCode: "PRV-ACERO",
    estadoId: 3,
    monedaId: 1,
    fechaDocumento: "2025-09-08",
    fechaVencimiento: "2025-10-08",
    comentarios: "Compra inicial para reposicion de materiales de planta",
    createdByEmail: "compras@erp.local",
    approvedByEmail: "supervisor@erp.local",
    lineas: [
      {
        id: "00000000-0000-0000-0000-000000000401",
        itemCode: "MAT-ACERO-01",
        almacenId: "ALM-01",
        cantidadTotal: 40,
        cantidadPendiente: 0,
        precioUnitario: 425,
      },
      {
        id: "00000000-0000-0000-0000-000000000402",
        itemCode: "ITEM-DEMO-001",
        almacenId: "ALM-01",
        cantidadTotal: 35,
        cantidadPendiente: 0,
        precioUnitario: 105,
      },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000302",
    tipoDocId: 2,
    docNum: 6102,
    proveedorCode: "PRV-ELECTRO",
    estadoId: 3,
    monedaId: 2,
    fechaDocumento: "2025-10-14",
    fechaVencimiento: "2025-11-14",
    comentarios: "Cableado para ampliacion del tablero principal",
    createdByEmail: "compras@erp.local",
    approvedByEmail: "supervisor@erp.local",
    lineas: [
      {
        id: "00000000-0000-0000-0000-000000000403",
        itemCode: "ELEC-CABLE-01",
        almacenId: "ALM-01",
        cantidadTotal: 480,
        cantidadPendiente: 0,
        precioUnitario: 39,
        descuentoLinea: 300,
      },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000303",
    tipoDocId: 2,
    docNum: 6103,
    proveedorCode: "PRV-LOG",
    estadoId: 5,
    monedaId: 1,
    fechaDocumento: "2025-11-19",
    fechaVencimiento: "2025-12-19",
    comentarios: "Servicio de soporte logistico y empaque",
    createdByEmail: "compras@erp.local",
    approvedByEmail: "supervisor@erp.local",
    lineas: [
      {
        id: "00000000-0000-0000-0000-000000000404",
        itemCode: "INS-CAJA-01",
        almacenId: "ALM-02",
        cantidadTotal: 1200,
        cantidadPendiente: 180,
        precioUnitario: 12.5,
      },
      {
        id: "00000000-0000-0000-0000-000000000405",
        itemCode: "INS-GUANTE-01",
        almacenId: "ALM-02",
        cantidadTotal: 90,
        cantidadPendiente: 20,
        precioUnitario: 98,
      },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000304",
    tipoDocId: 2,
    docNum: 6104,
    proveedorCode: "PRV-QUIM",
    estadoId: 2,
    monedaId: 1,
    fechaDocumento: "2025-12-06",
    fechaVencimiento: "2026-01-06",
    comentarios: "Insumos de limpieza industrial para cierre anual",
    createdByEmail: "compras@erp.local",
    approvedByEmail: "supervisor@erp.local",
    lineas: [
      {
        id: "00000000-0000-0000-0000-000000000406",
        itemCode: "INS-GUANTE-01",
        almacenId: "ALM-01",
        cantidadTotal: 140,
        cantidadPendiente: 60,
        precioUnitario: 96,
      },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000305",
    tipoDocId: 2,
    docNum: 6105,
    proveedorCode: "PRV-ACERO",
    estadoId: 5,
    monedaId: 1,
    fechaDocumento: "2026-01-12",
    fechaVencimiento: "2026-02-12",
    comentarios: "Reposicion de acero para plan preventivo",
    createdByEmail: "compras@erp.local",
    approvedByEmail: "supervisor@erp.local",
    lineas: [
      {
        id: "00000000-0000-0000-0000-000000000407",
        itemCode: "MAT-ACERO-01",
        almacenId: "ALM-01",
        cantidadTotal: 55,
        cantidadPendiente: 15,
        precioUnitario: 430,
        descuentoLinea: 450,
      },
      {
        id: "00000000-0000-0000-0000-000000000408",
        itemCode: "REP-MOTOR-01",
        almacenId: "ALM-01",
        cantidadTotal: 2,
        cantidadPendiente: 1,
        precioUnitario: 1840,
      },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000306",
    tipoDocId: 2,
    docNum: 6106,
    proveedorCode: "PRV-OFI",
    estadoId: 3,
    monedaId: 1,
    fechaDocumento: "2026-01-28",
    fechaVencimiento: "2026-02-28",
    comentarios: "Material de oficina para operaciones administrativas",
    createdByEmail: "compras@erp.local",
    approvedByEmail: "supervisor@erp.local",
    lineas: [
      {
        id: "00000000-0000-0000-0000-000000000409",
        itemCode: "ITEM-DEMO-001",
        almacenId: "ALM-02",
        cantidadTotal: 80,
        cantidadPendiente: 0,
        precioUnitario: 102,
      },
      {
        id: "00000000-0000-0000-0000-000000000410",
        itemCode: "INS-CAJA-01",
        almacenId: "ALM-02",
        cantidadTotal: 500,
        cantidadPendiente: 0,
        precioUnitario: 11.8,
      },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000307",
    tipoDocId: 2,
    docNum: 6107,
    proveedorCode: "PRV-ELECTRO",
    estadoId: 2,
    monedaId: 2,
    fechaDocumento: "2026-02-15",
    fechaVencimiento: "2026-03-15",
    comentarios: "Componentes electricos pendientes de recepcion parcial",
    createdByEmail: "compras@erp.local",
    approvedByEmail: "supervisor@erp.local",
    lineas: [
      {
        id: "00000000-0000-0000-0000-000000000411",
        itemCode: "ELEC-CABLE-01",
        almacenId: "ALM-01",
        cantidadTotal: 620,
        cantidadPendiente: 300,
        precioUnitario: 37.5,
      },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000308",
    tipoDocId: 2,
    docNum: 6108,
    proveedorCode: "PRV-LOG",
    estadoId: 1,
    monedaId: 1,
    fechaDocumento: "2026-02-27",
    fechaVencimiento: "2026-03-27",
    comentarios: "Borrador de compra logistica para evaluacion",
    createdByEmail: "compras@erp.local",
    lineas: [
      {
        id: "00000000-0000-0000-0000-000000000412",
        itemCode: "INS-CAJA-01",
        almacenId: "ALM-02",
        cantidadTotal: 700,
        cantidadPendiente: 700,
        precioUnitario: 12.1,
      },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000309",
    tipoDocId: 2,
    docNum: 6109,
    proveedorCode: "PRV-QUIM",
    estadoId: 5,
    monedaId: 1,
    fechaDocumento: "2026-03-08",
    fechaVencimiento: "2026-04-05",
    comentarios: "Compra de insumos de seguridad e higiene",
    createdByEmail: "compras@erp.local",
    approvedByEmail: "supervisor@erp.local",
    lineas: [
      {
        id: "00000000-0000-0000-0000-000000000413",
        itemCode: "INS-GUANTE-01",
        almacenId: "ALM-01",
        cantidadTotal: 180,
        cantidadPendiente: 95,
        precioUnitario: 94,
      },
      {
        id: "00000000-0000-0000-0000-000000000414",
        itemCode: "ITEM-DEMO-001",
        almacenId: "ALM-01",
        cantidadTotal: 120,
        cantidadPendiente: 40,
        precioUnitario: 99,
      },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000310",
    tipoDocId: 2,
    docNum: 6110,
    proveedorCode: "PRV-ACERO",
    estadoId: 2,
    monedaId: 1,
    fechaDocumento: "2026-03-22",
    fechaVencimiento: "2026-04-22",
    comentarios: "Compra abierta para mantenimiento de abril",
    createdByEmail: "compras@erp.local",
    approvedByEmail: "supervisor@erp.local",
    lineas: [
      {
        id: "00000000-0000-0000-0000-000000000415",
        itemCode: "MAT-ACERO-01",
        almacenId: "ALM-01",
        cantidadTotal: 65,
        cantidadPendiente: 35,
        precioUnitario: 428,
      },
      {
        id: "00000000-0000-0000-0000-000000000416",
        itemCode: "REP-MOTOR-01",
        almacenId: "ALM-01",
        cantidadTotal: 3,
        cantidadPendiente: 2,
        precioUnitario: 1810,
      },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000311",
    tipoDocId: 2,
    docNum: 6111,
    proveedorCode: "PRV-ELECTRO",
    estadoId: 5,
    monedaId: 2,
    fechaDocumento: "2026-04-03",
    fechaVencimiento: "2026-05-03",
    comentarios: "Pedido de cables para ampliacion de linea",
    createdByEmail: "compras@erp.local",
    approvedByEmail: "supervisor@erp.local",
    lineas: [
      {
        id: "00000000-0000-0000-0000-000000000417",
        itemCode: "ELEC-CABLE-01",
        almacenId: "ALM-02",
        cantidadTotal: 720,
        cantidadPendiente: 720,
        precioUnitario: 38.2,
      },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000312",
    tipoDocId: 2,
    docNum: 6112,
    proveedorCode: "PRV-OFI",
    estadoId: 5,
    monedaId: 1,
    fechaDocumento: "2026-04-11",
    fechaVencimiento: "2026-05-11",
    comentarios: "Empaques para despacho de segundo trimestre",
    createdByEmail: "compras@erp.local",
    approvedByEmail: "supervisor@erp.local",
    lineas: [
      {
        id: "00000000-0000-0000-0000-000000000418",
        itemCode: "INS-CAJA-01",
        almacenId: "ALM-02",
        cantidadTotal: 1500,
        cantidadPendiente: 1500,
        precioUnitario: 11.7,
      },
      {
        id: "00000000-0000-0000-0000-000000000419",
        itemCode: "ITEM-DEMO-001",
        almacenId: "ALM-02",
        cantidadTotal: 60,
        cantidadPendiente: 60,
        precioUnitario: 101,
      },
    ],
  },
] satisfies DemoOrden[];

const demoCuentasPorPagar = [
  {
    id: "00000000-0000-0000-0000-000000000501",
    ordenDocNum: 6101,
    proveedorCode: "PRV-ACERO",
    numeroFactura: "FAC-AC-6101",
    saldoRatio: 0,
    fechaVencimiento: "2026-02-12",
    estado: "PAGADA",
  },
  {
    id: "00000000-0000-0000-0000-000000000502",
    ordenDocNum: 6102,
    proveedorCode: "PRV-ELECTRO",
    numeroFactura: "FAC-EL-6102",
    saldoRatio: 0.35,
    fechaVencimiento: "2026-03-15",
    estado: "PARCIAL",
  },
  {
    id: "00000000-0000-0000-0000-000000000503",
    ordenDocNum: 6105,
    proveedorCode: "PRV-ACERO",
    numeroFactura: "FAC-AC-6105",
    saldoRatio: 0.45,
    fechaVencimiento: "2026-04-05",
    estado: "PARCIAL",
  },
  {
    id: "00000000-0000-0000-0000-000000000504",
    ordenDocNum: 6107,
    proveedorCode: "PRV-ELECTRO",
    numeroFactura: "FAC-EL-6107",
    saldoRatio: 1,
    fechaVencimiento: "2026-04-22",
    estado: "PENDIENTE",
  },
  {
    id: "00000000-0000-0000-0000-000000000505",
    ordenDocNum: 6109,
    proveedorCode: "PRV-QUIM",
    numeroFactura: "FAC-QM-6109",
    saldoRatio: 0.6,
    fechaVencimiento: "2026-05-03",
    estado: "PARCIAL",
  },
  {
    id: "00000000-0000-0000-0000-000000000506",
    ordenDocNum: 6110,
    proveedorCode: "PRV-ACERO",
    numeroFactura: "FAC-AC-6110",
    saldoRatio: 1,
    fechaVencimiento: "2026-05-11",
    estado: "PENDIENTE",
  },
  {
    id: "00000000-0000-0000-0000-000000000507",
    ordenDocNum: 6111,
    proveedorCode: "PRV-ELECTRO",
    numeroFactura: "FAC-EL-6111",
    saldoRatio: 1,
    fechaVencimiento: "2026-05-19",
    estado: "PENDIENTE",
  },
  {
    id: "00000000-0000-0000-0000-000000000508",
    ordenDocNum: 6112,
    proveedorCode: "PRV-OFI",
    numeroFactura: "FAC-OF-6112",
    saldoRatio: 0,
    fechaVencimiento: "2026-04-16",
    estado: "PAGADA",
  },
] satisfies DemoCuentaPorPagar[];

const demoPagos = [
  {
    id: "00000000-0000-0000-0000-000000000601",
    cuentaId: "00000000-0000-0000-0000-000000000501",
    referencia: "TRF-BCP-6101",
    fechaPago: "2026-02-10T10:20:00.000Z",
    createdByEmail: "compras@erp.local",
  },
  {
    id: "00000000-0000-0000-0000-000000000602",
    cuentaId: "00000000-0000-0000-0000-000000000502",
    referencia: "TRF-BNB-6102-A",
    fechaPago: "2026-03-01T16:15:00.000Z",
    createdByEmail: "compras@erp.local",
  },
  {
    id: "00000000-0000-0000-0000-000000000603",
    cuentaId: "00000000-0000-0000-0000-000000000503",
    referencia: "TRF-BCP-6105-A",
    fechaPago: "2026-04-02T12:40:00.000Z",
    createdByEmail: "compras@erp.local",
  },
  {
    id: "00000000-0000-0000-0000-000000000604",
    cuentaId: "00000000-0000-0000-0000-000000000505",
    referencia: "TRF-UNI-6109-A",
    fechaPago: "2026-04-12T18:10:00.000Z",
    createdByEmail: "supervisor@erp.local",
  },
  {
    id: "00000000-0000-0000-0000-000000000605",
    cuentaId: "00000000-0000-0000-0000-000000000508",
    referencia: "TRF-BISA-6112",
    fechaPago: "2026-04-16T20:05:00.000Z",
    createdByEmail: "compras@erp.local",
  },
] satisfies DemoPago[];

const demoStocks = [
  {
    id: "00000000-0000-0000-0000-000000000701",
    itemCode: "MAT-ACERO-01",
    almacenId: "ALM-01",
    stockFisico: 180,
    comprometido: 38,
    solicitado: 100,
  },
  {
    id: "00000000-0000-0000-0000-000000000702",
    itemCode: "MAT-ACERO-01",
    almacenId: "ALM-02",
    stockFisico: 44,
    comprometido: 10,
    solicitado: 20,
  },
  {
    id: "00000000-0000-0000-0000-000000000703",
    itemCode: "ELEC-CABLE-01",
    almacenId: "ALM-01",
    stockFisico: 960,
    comprometido: 250,
    solicitado: 620,
  },
  {
    id: "00000000-0000-0000-0000-000000000704",
    itemCode: "ELEC-CABLE-01",
    almacenId: "ALM-02",
    stockFisico: 420,
    comprometido: 80,
    solicitado: 720,
  },
  {
    id: "00000000-0000-0000-0000-000000000705",
    itemCode: "INS-GUANTE-01",
    almacenId: "ALM-01",
    stockFisico: 310,
    comprometido: 45,
    solicitado: 95,
  },
  {
    id: "00000000-0000-0000-0000-000000000706",
    itemCode: "INS-CAJA-01",
    almacenId: "ALM-02",
    stockFisico: 2150,
    comprometido: 400,
    solicitado: 2200,
  },
  {
    id: "00000000-0000-0000-0000-000000000707",
    itemCode: "REP-MOTOR-01",
    almacenId: "ALM-01",
    stockFisico: 9,
    comprometido: 3,
    solicitado: 3,
  },
  {
    id: "00000000-0000-0000-0000-000000000708",
    itemCode: "ITEM-DEMO-001",
    almacenId: "ALM-01",
    stockFisico: 260,
    comprometido: 35,
    solicitado: 100,
  },
] satisfies DemoStock[];

const demoMovimientos = [
  {
    id: "00000000-0000-0000-0000-000000000801",
    itemCode: "MAT-ACERO-01",
    almacenId: "ALM-01",
    ordenDocNum: 6101,
    tipoMovimiento: "IN",
    cantidad: 40,
    costoMomento: 425,
    usuarioEmail: "almacen@erp.local",
    fecha: "2025-09-10T14:30:00.000Z",
    comentario: "Ingreso por recepcion completa OC-6101",
  },
  {
    id: "00000000-0000-0000-0000-000000000802",
    itemCode: "ELEC-CABLE-01",
    almacenId: "ALM-01",
    ordenDocNum: 6102,
    tipoMovimiento: "IN",
    cantidad: 480,
    costoMomento: 39,
    usuarioEmail: "almacen@erp.local",
    fecha: "2025-10-16T15:10:00.000Z",
    comentario: "Ingreso por cableado de ampliacion",
  },
  {
    id: "00000000-0000-0000-0000-000000000803",
    itemCode: "INS-CAJA-01",
    almacenId: "ALM-02",
    ordenDocNum: 6103,
    tipoMovimiento: "IN",
    cantidad: 1020,
    costoMomento: 12.5,
    usuarioEmail: "almacen@erp.local",
    fecha: "2025-11-21T13:00:00.000Z",
    comentario: "Ingreso parcial por recepcion de empaques",
  },
  {
    id: "00000000-0000-0000-0000-000000000804",
    itemCode: "INS-GUANTE-01",
    almacenId: "ALM-01",
    ordenDocNum: 6104,
    tipoMovimiento: "OUT",
    cantidad: 35,
    costoMomento: 96,
    usuarioEmail: "almacen@erp.local",
    fecha: "2025-12-12T17:20:00.000Z",
    comentario: "Salida a area de mantenimiento",
  },
  {
    id: "00000000-0000-0000-0000-000000000805",
    itemCode: "MAT-ACERO-01",
    almacenId: "ALM-01",
    ordenDocNum: 6105,
    tipoMovimiento: "IN",
    cantidad: 40,
    costoMomento: 430,
    usuarioEmail: "almacen@erp.local",
    fecha: "2026-01-16T14:30:00.000Z",
    comentario: "Ingreso parcial de acero",
  },
  {
    id: "00000000-0000-0000-0000-000000000806",
    itemCode: "ELEC-CABLE-01",
    almacenId: "ALM-01",
    ordenDocNum: 6107,
    tipoMovimiento: "OUT",
    cantidad: 140,
    costoMomento: 37.5,
    usuarioEmail: "almacen@erp.local",
    fecha: "2026-02-21T10:05:00.000Z",
    comentario: "Salida por instalacion de tablero",
  },
  {
    id: "00000000-0000-0000-0000-000000000807",
    itemCode: "INS-GUANTE-01",
    almacenId: "ALM-01",
    ordenDocNum: 6109,
    tipoMovimiento: "IN",
    cantidad: 85,
    costoMomento: 94,
    usuarioEmail: "almacen@erp.local",
    fecha: "2026-03-11T12:25:00.000Z",
    comentario: "Ingreso de insumos de seguridad",
  },
  {
    id: "00000000-0000-0000-0000-000000000808",
    itemCode: "REP-MOTOR-01",
    almacenId: "ALM-01",
    ordenDocNum: 6110,
    tipoMovimiento: "IN",
    cantidad: 1,
    costoMomento: 1810,
    usuarioEmail: "almacen@erp.local",
    fecha: "2026-03-25T19:35:00.000Z",
    comentario: "Ingreso parcial de motor reductor",
  },
  {
    id: "00000000-0000-0000-0000-000000000809",
    itemCode: "INS-CAJA-01",
    almacenId: "ALM-02",
    ordenDocNum: 6112,
    tipoMovimiento: "OUT",
    cantidad: 300,
    costoMomento: 11.7,
    usuarioEmail: "almacen@erp.local",
    fecha: "2026-04-15T21:15:00.000Z",
    comentario: "Salida para preparacion de despachos",
  },
] satisfies DemoMovimiento[];

const demoAuditoria = [
  {
    id: "00000000-0000-0000-0000-000000000901",
    usuarioEmail: "compras@erp.local",
    entidad: "OrdenCompra",
    entidadIdCode: "ORD-6101",
    accion: "CREAR",
    datosDespues: { docNum: 6101, estado: "CERRADO" },
    ipOrigen: "127.0.0.1",
    fecha: "2025-09-08T09:10:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000902",
    usuarioEmail: "supervisor@erp.local",
    entidad: "OrdenCompra",
    entidadIdCode: "ORD-6105",
    accion: "APROBAR",
    datosAntes: { estado: "BORRADOR" },
    datosDespues: { estado: "APROBADO" },
    ipOrigen: "127.0.0.1",
    fecha: "2026-01-13T11:40:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000903",
    usuarioEmail: "almacen@erp.local",
    entidad: "Inventario",
    entidadIdCode: "ART-MAT-ACERO-01",
    accion: "RECIBIR",
    datosDespues: { cantidad: 40, almacen: "ALM-01" },
    ipOrigen: "127.0.0.1",
    fecha: "2026-01-16T14:35:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000904",
    usuarioEmail: "compras@erp.local",
    entidad: "CuentaPorPagar",
    entidadIdCode: "CXP-000000000503",
    accion: "REGISTRAR",
    datosDespues: { factura: "FAC-AC-6105", estado: "PARCIAL" },
    ipOrigen: "127.0.0.1",
    fecha: "2026-04-02T12:45:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000905",
    usuarioEmail: "supervisor@erp.local",
    entidad: "PagoProveedor",
    entidadIdCode: "PAGO-000000000604",
    accion: "PAGAR",
    datosDespues: { referencia: "TRF-UNI-6109-A" },
    ipOrigen: "127.0.0.1",
    fecha: "2026-04-12T18:12:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000906",
    usuarioEmail: "admin@erp.local",
    entidad: "Usuario",
    entidadIdCode: "USER-compras@erp.local",
    accion: "ACTUALIZAR",
    datosAntes: { twoFactorEnabled: false },
    datosDespues: { twoFactorEnabled: true },
    ipOrigen: "127.0.0.1",
    fecha: "2026-04-15T08:00:00.000Z",
  },
] satisfies DemoAuditoria[];

const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const requireMapValue = <TKey>(map: Map<TKey, string>, key: TKey, label: string): string => {
  const value = map.get(key);
  if (!value) {
    throw new Error(`No existe ${label}: ${key}`);
  }

  return value;
};

const firstId = (rows: IdRow[], context: string): string => {
  const id = rows[0]?.id;
  if (!id) {
    throw new Error(`No se pudo resolver id para ${context}`);
  }

  return id;
};

const seedUsuario = async (dataSource: DataSource, demoUser: DemoUser): Promise<string> => {
  const passwordHash = await Bun.password.hash(demoUser.password);
  const existing = (await dataSource.query(
    "SELECT id FROM o_usuarios WHERE username = $1 OR email = $2 LIMIT 1",
    [demoUser.username, demoUser.email],
  )) as IdRow[];

  if (existing[0]?.id) {
    const rows = (await dataSource.query(
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
        RETURNING id
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
    )) as IdRow[];
    return firstId(rows, demoUser.email);
  }

  const rows = (await dataSource.query(
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
      RETURNING id
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
  )) as IdRow[];
  return firstId(rows, demoUser.email);
};

const seedProveedor = async (
  dataSource: DataSource,
  proveedor: DemoProveedor,
): Promise<string> => {
  const rows = (await dataSource.query(
    `
      INSERT INTO o_proveedores (
        id,
        card_code,
        card_name,
        nombre_comercial,
        nit_rut,
        email,
        telefono,
        direccion,
        moneda_id,
        balance_cuenta,
        linea_credito,
        activo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, TRUE)
      ON CONFLICT (card_code)
      DO UPDATE SET
        card_name = EXCLUDED.card_name,
        nombre_comercial = EXCLUDED.nombre_comercial,
        nit_rut = EXCLUDED.nit_rut,
        email = EXCLUDED.email,
        telefono = EXCLUDED.telefono,
        direccion = EXCLUDED.direccion,
        moneda_id = EXCLUDED.moneda_id,
        linea_credito = EXCLUDED.linea_credito,
        updated_at = NOW()
      RETURNING id
    `,
    [
      proveedor.id,
      proveedor.cardCode,
      proveedor.cardName,
      proveedor.nombreComercial ?? null,
      proveedor.nitRut,
      proveedor.email,
      proveedor.telefono,
      proveedor.direccion,
      proveedor.monedaId,
      proveedor.lineaCredito.toFixed(2),
    ],
  )) as IdRow[];
  return firstId(rows, proveedor.cardCode);
};

const seedArticulo = async (dataSource: DataSource, articulo: DemoArticulo): Promise<string> => {
  const rows = (await dataSource.query(
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
      RETURNING id
    `,
    [
      articulo.id,
      articulo.itemCode,
      articulo.itemName,
      articulo.descripcion,
      articulo.unidadMedida,
      articulo.costoEstandar.toFixed(4),
      articulo.grupoId,
      articulo.impuestoId,
    ],
  )) as IdRow[];
  return firstId(rows, articulo.itemCode);
};

const seedOrdenCompra = async (
  dataSource: DataSource,
  orden: DemoOrden,
  userIdsByEmail: Map<string, string>,
  providerIdsByCode: Map<string, string>,
  articleIdsByCode: Map<string, string>,
): Promise<{ id: string; total: number }> => {
  let subtotal = 0;
  let descuentoTotal = 0;
  let impuestosTotal = 0;
  let totalDocumento = 0;

  const calculatedLines = orden.lineas.map((linea, index) => {
    const articulo = demoArticulos.find((item) => item.itemCode === linea.itemCode);
    if (!articulo) {
      throw new Error(`Articulo no configurado: ${linea.itemCode}`);
    }

    const descuentoLinea = linea.descuentoLinea ?? 0;
    const subtotalLinea = roundMoney(linea.cantidadTotal * linea.precioUnitario);
    const baseLinea = roundMoney(Math.max(subtotalLinea - descuentoLinea, 0));
    const tasaImpuesto = articulo.impuestoId === 1 ? 13 : 0;
    const impuestoLinea = roundMoney((baseLinea * tasaImpuesto) / 100);
    const totalLinea = roundMoney(baseLinea + impuestoLinea);

    subtotal = roundMoney(subtotal + subtotalLinea);
    descuentoTotal = roundMoney(descuentoTotal + descuentoLinea);
    impuestosTotal = roundMoney(impuestosTotal + impuestoLinea);
    totalDocumento = roundMoney(totalDocumento + totalLinea);

    return {
      ...linea,
      lineNum: index,
      impuestoId: articulo.impuestoId,
      descripcion: articulo.itemName,
      subtotalLinea,
      totalLinea,
    };
  });

  const createdBy = requireMapValue(userIdsByEmail, orden.createdByEmail, "usuario");
  const approvedBy = orden.approvedByEmail
    ? requireMapValue(userIdsByEmail, orden.approvedByEmail, "usuario aprobador")
    : null;
  const proveedorId = requireMapValue(providerIdsByCode, orden.proveedorCode, "proveedor");

  const rows = (await dataSource.query(
    `
      INSERT INTO compras_encabezado (
        id,
        tipo_doc_id,
        doc_num,
        proveedor_id,
        estado_id,
        moneda_id,
        fecha_documento,
        fecha_vencimiento,
        subtotal,
        descuento_total,
        impuestos_total,
        total_documento,
        comentarios,
        created_by,
        approved_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (tipo_doc_id, doc_num)
      DO UPDATE SET
        proveedor_id = EXCLUDED.proveedor_id,
        estado_id = EXCLUDED.estado_id,
        moneda_id = EXCLUDED.moneda_id,
        fecha_documento = EXCLUDED.fecha_documento,
        fecha_vencimiento = EXCLUDED.fecha_vencimiento,
        subtotal = EXCLUDED.subtotal,
        descuento_total = EXCLUDED.descuento_total,
        impuestos_total = EXCLUDED.impuestos_total,
        total_documento = EXCLUDED.total_documento,
        comentarios = EXCLUDED.comentarios,
        created_by = EXCLUDED.created_by,
        approved_by = EXCLUDED.approved_by,
        updated_at = NOW()
      RETURNING id
    `,
    [
      orden.id,
      orden.tipoDocId,
      orden.docNum,
      proveedorId,
      orden.estadoId,
      orden.monedaId,
      orden.fechaDocumento,
      orden.fechaVencimiento ?? null,
      subtotal.toFixed(2),
      descuentoTotal.toFixed(2),
      impuestosTotal.toFixed(2),
      totalDocumento.toFixed(2),
      orden.comentarios,
      createdBy,
      approvedBy,
    ],
  )) as IdRow[];

  const ordenId = firstId(rows, `OC-${orden.docNum}`);
  const detalleIds = calculatedLines.map((linea) => linea.id);
  await dataSource.query(
    "DELETE FROM compras_detalle WHERE doc_id = $1 OR id = ANY($2::uuid[])",
    [ordenId, detalleIds],
  );

  for (const linea of calculatedLines) {
    const articuloId = requireMapValue(articleIdsByCode, linea.itemCode, "articulo");
    await dataSource.query(
      `
        INSERT INTO compras_detalle (
          id,
          doc_id,
          line_num,
          articulo_id,
          almacen_id,
          impuesto_id,
          descripcion,
          cantidad_total,
          cantidad_pendiente,
          precio_unitario,
          descuento_linea,
          subtotal_linea,
          total_linea
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `,
      [
        linea.id,
        ordenId,
        linea.lineNum,
        articuloId,
        linea.almacenId,
        linea.impuestoId,
        linea.descripcion,
        linea.cantidadTotal.toFixed(4),
        linea.cantidadPendiente.toFixed(4),
        linea.precioUnitario.toFixed(4),
        (linea.descuentoLinea ?? 0).toFixed(2),
        linea.subtotalLinea.toFixed(2),
        linea.totalLinea.toFixed(2),
      ],
    );
  }

  return { id: ordenId, total: totalDocumento };
};

const seedCuentaPorPagar = async (
  dataSource: DataSource,
  cuenta: DemoCuentaPorPagar,
  orderIdsByDocNum: Map<number, string>,
  orderTotalsByDocNum: Map<number, number>,
  providerIdsByCode: Map<string, string>,
): Promise<{ id: string; proveedorId: string; montoTotal: number; saldoPendiente: number }> => {
  const compraId = requireMapValue(orderIdsByDocNum, cuenta.ordenDocNum, "orden");
  const proveedorId = requireMapValue(providerIdsByCode, cuenta.proveedorCode, "proveedor");
  const montoTotal = roundMoney(orderTotalsByDocNum.get(cuenta.ordenDocNum) ?? 0);
  const saldoPendiente = roundMoney(montoTotal * cuenta.saldoRatio);

  const rows = (await dataSource.query(
    `
      INSERT INTO cxp_cuentas_por_pagar (
        id,
        compra_id,
        proveedor_id,
        numero_factura,
        monto_total,
        saldo_pendiente,
        fecha_vencimiento,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (proveedor_id, numero_factura)
      DO UPDATE SET
        compra_id = EXCLUDED.compra_id,
        monto_total = EXCLUDED.monto_total,
        saldo_pendiente = EXCLUDED.saldo_pendiente,
        fecha_vencimiento = EXCLUDED.fecha_vencimiento,
        estado = EXCLUDED.estado,
        updated_at = NOW()
      RETURNING id
    `,
    [
      cuenta.id,
      compraId,
      proveedorId,
      cuenta.numeroFactura,
      montoTotal.toFixed(2),
      saldoPendiente.toFixed(2),
      cuenta.fechaVencimiento,
      cuenta.estado,
    ],
  )) as IdRow[];

  return {
    id: firstId(rows, cuenta.numeroFactura),
    proveedorId,
    montoTotal,
    saldoPendiente,
  };
};

const seedPago = async (
  dataSource: DataSource,
  pago: DemoPago,
  cuentasBySeedId: Map<string, { id: string; proveedorId: string; montoTotal: number; saldoPendiente: number }>,
  userIdsByEmail: Map<string, string>,
): Promise<void> => {
  const cuenta = cuentasBySeedId.get(pago.cuentaId);
  if (!cuenta) {
    throw new Error(`No existe cuenta por pagar demo: ${pago.cuentaId}`);
  }

  const monto = roundMoney(cuenta.montoTotal - cuenta.saldoPendiente);
  if (monto <= 0) {
    return;
  }

  await dataSource.query(
    `
      INSERT INTO cxp_pagos_proveedor (
        id,
        cuenta_por_pagar_id,
        proveedor_id,
        monto,
        fecha_pago,
        referencia,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id)
      DO UPDATE SET
        cuenta_por_pagar_id = EXCLUDED.cuenta_por_pagar_id,
        proveedor_id = EXCLUDED.proveedor_id,
        monto = EXCLUDED.monto,
        fecha_pago = EXCLUDED.fecha_pago,
        referencia = EXCLUDED.referencia,
        created_by = EXCLUDED.created_by
    `,
    [
      pago.id,
      cuenta.id,
      cuenta.proveedorId,
      monto.toFixed(2),
      pago.fechaPago,
      pago.referencia,
      requireMapValue(userIdsByEmail, pago.createdByEmail, "usuario"),
    ],
  );
};

const seedStock = async (
  dataSource: DataSource,
  stock: DemoStock,
  articleIdsByCode: Map<string, string>,
): Promise<void> => {
  const articuloId = requireMapValue(articleIdsByCode, stock.itemCode, "articulo");
  const disponible = Math.max(stock.stockFisico - stock.comprometido, 0);

  await dataSource.query(
    `
      INSERT INTO o_articulo_almacen (
        id,
        articulo_id,
        almacen_id,
        stock_fisico,
        comprometido,
        solicitado,
        stock_disponible
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (articulo_id, almacen_id)
      DO UPDATE SET
        stock_fisico = EXCLUDED.stock_fisico,
        comprometido = EXCLUDED.comprometido,
        solicitado = EXCLUDED.solicitado,
        stock_disponible = EXCLUDED.stock_disponible
    `,
    [
      stock.id,
      articuloId,
      stock.almacenId,
      stock.stockFisico.toFixed(4),
      stock.comprometido.toFixed(4),
      stock.solicitado.toFixed(4),
      disponible.toFixed(4),
    ],
  );
};

const seedMovimiento = async (
  dataSource: DataSource,
  movimiento: DemoMovimiento,
  articleIdsByCode: Map<string, string>,
  orderIdsByDocNum: Map<number, string>,
  userIdsByEmail: Map<string, string>,
): Promise<void> => {
  await dataSource.query(
    `
      INSERT INTO diario_inventario (
        id,
        articulo_id,
        almacen_id,
        doc_referencia_id,
        tipo_movimiento,
        cantidad,
        costo_momento,
        usuario_id,
        fecha,
        comentario
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id)
      DO UPDATE SET
        articulo_id = EXCLUDED.articulo_id,
        almacen_id = EXCLUDED.almacen_id,
        doc_referencia_id = EXCLUDED.doc_referencia_id,
        tipo_movimiento = EXCLUDED.tipo_movimiento,
        cantidad = EXCLUDED.cantidad,
        costo_momento = EXCLUDED.costo_momento,
        usuario_id = EXCLUDED.usuario_id,
        fecha = EXCLUDED.fecha,
        comentario = EXCLUDED.comentario
    `,
    [
      movimiento.id,
      requireMapValue(articleIdsByCode, movimiento.itemCode, "articulo"),
      movimiento.almacenId,
      requireMapValue(orderIdsByDocNum, movimiento.ordenDocNum, "orden"),
      movimiento.tipoMovimiento,
      movimiento.cantidad.toFixed(4),
      movimiento.costoMomento.toFixed(4),
      requireMapValue(userIdsByEmail, movimiento.usuarioEmail, "usuario"),
      movimiento.fecha,
      movimiento.comentario,
    ],
  );
};

const resolveAuditEntityId = (
  audit: DemoAuditoria,
  userIdsByEmail: Map<string, string>,
  articleIdsByCode: Map<string, string>,
  orderIdsByDocNum: Map<number, string>,
  cuentasBySeedId: Map<string, { id: string }>,
): string | null => {
  if (!audit.entidadIdCode) {
    return null;
  }

  if (audit.entidadIdCode.startsWith("ORD-")) {
    return requireMapValue(orderIdsByDocNum, Number(audit.entidadIdCode.replace("ORD-", "")), "orden");
  }

  if (audit.entidadIdCode.startsWith("ART-")) {
    return requireMapValue(articleIdsByCode, audit.entidadIdCode.replace("ART-", ""), "articulo");
  }

  if (audit.entidadIdCode.startsWith("CXP-")) {
    return cuentasBySeedId.get(`00000000-0000-0000-0000-${audit.entidadIdCode.replace("CXP-", "")}`)?.id ?? null;
  }

  if (audit.entidadIdCode.startsWith("USER-")) {
    return requireMapValue(userIdsByEmail, audit.entidadIdCode.replace("USER-", ""), "usuario");
  }

  return null;
};

const seedAuditoria = async (
  dataSource: DataSource,
  audit: DemoAuditoria,
  userIdsByEmail: Map<string, string>,
  articleIdsByCode: Map<string, string>,
  orderIdsByDocNum: Map<number, string>,
  cuentasBySeedId: Map<string, { id: string }>,
): Promise<void> => {
  await dataSource.query(
    `
      INSERT INTO auditoria_eventos (
        id,
        usuario_id,
        entidad,
        entidad_id,
        accion,
        datos_antes,
        datos_despues,
        ip_origen,
        fecha
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id)
      DO UPDATE SET
        usuario_id = EXCLUDED.usuario_id,
        entidad = EXCLUDED.entidad,
        entidad_id = EXCLUDED.entidad_id,
        accion = EXCLUDED.accion,
        datos_antes = EXCLUDED.datos_antes,
        datos_despues = EXCLUDED.datos_despues,
        ip_origen = EXCLUDED.ip_origen,
        fecha = EXCLUDED.fecha
    `,
    [
      audit.id,
      requireMapValue(userIdsByEmail, audit.usuarioEmail, "usuario"),
      audit.entidad,
      resolveAuditEntityId(audit, userIdsByEmail, articleIdsByCode, orderIdsByDocNum, cuentasBySeedId),
      audit.accion,
      audit.datosAntes ? JSON.stringify(audit.datosAntes) : null,
      audit.datosDespues ? JSON.stringify(audit.datosDespues) : null,
      audit.ipOrigen,
      audit.fecha,
    ],
  );
};

const refreshProviderBalances = async (
  dataSource: DataSource,
  providerIdsByCode: Map<string, string>,
): Promise<void> => {
  const providerIds = [...providerIdsByCode.values()];
  await dataSource.query(
    `
      UPDATE o_proveedores proveedor
      SET balance_cuenta = COALESCE((
        SELECT SUM(cuenta.saldo_pendiente)
        FROM cxp_cuentas_por_pagar cuenta
        WHERE cuenta.proveedor_id = proveedor.id
      ), 0),
      updated_at = NOW()
      WHERE proveedor.id = ANY($1::uuid[])
    `,
    [providerIds],
  );
};

const main = async (): Promise<void> => {
  const dataSource = createAppDataSource();
  await dataSource.initialize();

  try {
    const userIdsByEmail = new Map<string, string>();
    const providerIdsByCode = new Map<string, string>();
    const articleIdsByCode = new Map<string, string>();
    const orderIdsByDocNum = new Map<number, string>();
    const orderTotalsByDocNum = new Map<number, number>();
    const cuentasBySeedId = new Map<
      string,
      { id: string; proveedorId: string; montoTotal: number; saldoPendiente: number }
    >();

    for (const demoUser of demoUsers) {
      userIdsByEmail.set(demoUser.email, await seedUsuario(dataSource, demoUser));
    }

    for (const demoProveedor of demoProveedores) {
      providerIdsByCode.set(
        demoProveedor.cardCode,
        await seedProveedor(dataSource, demoProveedor),
      );
    }

    for (const demoArticulo of demoArticulos) {
      articleIdsByCode.set(
        demoArticulo.itemCode,
        await seedArticulo(dataSource, demoArticulo),
      );
    }

    for (const orden of demoOrdenes) {
      const seededOrder = await seedOrdenCompra(
        dataSource,
        orden,
        userIdsByEmail,
        providerIdsByCode,
        articleIdsByCode,
      );
      orderIdsByDocNum.set(orden.docNum, seededOrder.id);
      orderTotalsByDocNum.set(orden.docNum, seededOrder.total);
    }

    for (const cuenta of demoCuentasPorPagar) {
      cuentasBySeedId.set(
        cuenta.id,
        await seedCuentaPorPagar(
          dataSource,
          cuenta,
          orderIdsByDocNum,
          orderTotalsByDocNum,
          providerIdsByCode,
        ),
      );
    }

    for (const pago of demoPagos) {
      await seedPago(dataSource, pago, cuentasBySeedId, userIdsByEmail);
    }

    for (const stock of demoStocks) {
      await seedStock(dataSource, stock, articleIdsByCode);
    }

    for (const movimiento of demoMovimientos) {
      await seedMovimiento(
        dataSource,
        movimiento,
        articleIdsByCode,
        orderIdsByDocNum,
        userIdsByEmail,
      );
    }

    for (const audit of demoAuditoria) {
      await seedAuditoria(
        dataSource,
        audit,
        userIdsByEmail,
        articleIdsByCode,
        orderIdsByDocNum,
        cuentasBySeedId,
      );
    }

    await refreshProviderBalances(dataSource, providerIdsByCode);

    console.log("Seed de demo aplicado");
    for (const demoUser of demoUsers) {
      console.log(`Usuario demo: ${demoUser.email} / ${demoUser.password}`);
    }
    console.log(`Proveedores demo: ${demoProveedores.length}`);
    console.log(`Articulos demo: ${demoArticulos.length}`);
    console.log(`Ordenes demo: ${demoOrdenes.length}`);
    console.log(`Cuentas por pagar demo: ${demoCuentasPorPagar.length}`);
    console.log(`Movimientos demo: ${demoMovimientos.length}`);
    console.log(`Eventos de auditoria demo: ${demoAuditoria.length}`);
  } finally {
    await dataSource.destroy();
  }
};

void main();
