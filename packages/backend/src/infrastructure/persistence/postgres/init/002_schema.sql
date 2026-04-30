CREATE TABLE IF NOT EXISTS o_monedas (
  id              INTEGER PRIMARY KEY,
  codigo          VARCHAR(3) NOT NULL UNIQUE,
  nombre          VARCHAR(100) NOT NULL,
  tasa_actual     NUMERIC(10,4) NOT NULL DEFAULT 1.0000
);

CREATE TABLE IF NOT EXISTS o_almacenes (
  id              VARCHAR(20) PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  ubicacion       TEXT,
  activo          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS o_impuestos (
  id              INTEGER PRIMARY KEY,
  tax_code        VARCHAR(10) NOT NULL UNIQUE,
  nombre          VARCHAR(100) NOT NULL,
  porcentaje      NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  activo          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS o_grupos_articulo (
  id              INTEGER PRIMARY KEY,
  codigo          VARCHAR(20) NOT NULL UNIQUE,
  nombre          VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS o_estados_documento (
  id              INTEGER PRIMARY KEY,
  codigo          VARCHAR(20) NOT NULL UNIQUE,
  nombre          VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS o_tipos_documento (
  id                  INTEGER PRIMARY KEY,
  codigo              VARCHAR(5) NOT NULL UNIQUE,
  nombre              VARCHAR(100) NOT NULL,
  afecta_inventario   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS o_roles (
  id              INTEGER PRIMARY KEY,
  codigo          VARCHAR(20) NOT NULL UNIQUE,
  nombre          VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS o_usuarios (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username            VARCHAR(50) NOT NULL UNIQUE,
  nombre_completo     VARCHAR(150) NOT NULL,
  email               VARCHAR(150) NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,
  google_sub          VARCHAR(255) UNIQUE,
  rol_id              INTEGER NOT NULL REFERENCES o_roles(id),
  activo              BOOLEAN NOT NULL DEFAULT TRUE,
  two_factor_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_secret   VARCHAR(255),
  ultimo_login        TIMESTAMP,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      UUID NOT NULL REFERENCES o_usuarios(id) ON DELETE CASCADE,
  token_hash      TEXT NOT NULL,
  issued_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMP NOT NULL,
  revoked_at      TIMESTAMP,
  user_agent      TEXT,
  ip_origen       VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS auth_2fa_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      UUID NOT NULL REFERENCES o_usuarios(id) ON DELETE CASCADE,
  codigo_hash     VARCHAR(255) NOT NULL,
  canal           VARCHAR(20) NOT NULL,
  expires_at      TIMESTAMP NOT NULL,
  used_at         TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_auth_2fa_codes_canal
    CHECK (canal IN ('EMAIL', 'SMS', 'WHATSAPP', 'VOICE', 'APP'))
);

CREATE TABLE IF NOT EXISTS o_proveedores (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_code           VARCHAR(20) NOT NULL UNIQUE,
  card_name           VARCHAR(150) NOT NULL,
  nombre_comercial    VARCHAR(150),
  nit_rut             VARCHAR(50) NOT NULL,
  email               VARCHAR(150),
  telefono            VARCHAR(30),
  direccion           TEXT,
  moneda_id           INTEGER NOT NULL REFERENCES o_monedas(id),
  balance_cuenta      NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  linea_credito       NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  activo              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS o_articulos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code           VARCHAR(50) NOT NULL UNIQUE,
  item_name           VARCHAR(150) NOT NULL,
  descripcion         TEXT,
  unidad_medida       VARCHAR(20) NOT NULL DEFAULT 'UNI',
  costo_estandar      NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
  grupo_id            INTEGER NOT NULL REFERENCES o_grupos_articulo(id),
  impuesto_id         INTEGER NOT NULL REFERENCES o_impuestos(id),
  activo              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS o_articulo_almacen (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  articulo_id         UUID NOT NULL REFERENCES o_articulos(id) ON DELETE CASCADE,
  almacen_id          VARCHAR(20) NOT NULL REFERENCES o_almacenes(id),
  stock_fisico        NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
  comprometido        NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
  solicitado          NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
  stock_disponible    NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
  CONSTRAINT uq_articulo_almacen UNIQUE (articulo_id, almacen_id)
);

CREATE TABLE IF NOT EXISTS compras_encabezado (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_doc_id             INTEGER NOT NULL REFERENCES o_tipos_documento(id),
  doc_num                 INTEGER NOT NULL,
  proveedor_id            UUID REFERENCES o_proveedores(id),
  estado_id               INTEGER NOT NULL REFERENCES o_estados_documento(id),
  moneda_id               INTEGER NOT NULL REFERENCES o_monedas(id),
  fecha_documento         DATE NOT NULL,
  fecha_contabilizacion   TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_vencimiento       DATE,
  subtotal                NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  descuento_total         NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  impuestos_total         NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  total_documento         NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  comentarios             TEXT,
  is_canceled             BOOLEAN NOT NULL DEFAULT FALSE,
  doc_cancelado_id        UUID REFERENCES compras_encabezado(id),
  created_by              UUID NOT NULL REFERENCES o_usuarios(id),
  approved_by             UUID REFERENCES o_usuarios(id),
  created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_compras_doc UNIQUE (tipo_doc_id, doc_num)
);

CREATE TABLE IF NOT EXISTS compras_detalle (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id              UUID NOT NULL REFERENCES compras_encabezado(id) ON DELETE CASCADE,
  line_num            INTEGER NOT NULL,
  articulo_id         UUID NOT NULL REFERENCES o_articulos(id),
  almacen_id          VARCHAR(20) NOT NULL REFERENCES o_almacenes(id),
  impuesto_id         INTEGER NOT NULL REFERENCES o_impuestos(id),
  descripcion         TEXT,
  cantidad_total      NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
  cantidad_pendiente  NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
  precio_unitario     NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
  descuento_linea     NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  subtotal_linea      NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  total_linea         NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  base_tipo_doc_id    INTEGER REFERENCES o_tipos_documento(id),
  base_entry          UUID,
  base_line           INTEGER,
  CONSTRAINT uq_compras_detalle UNIQUE (doc_id, line_num),
  CONSTRAINT chk_cantidad_total CHECK (cantidad_total >= 0),
  CONSTRAINT chk_cantidad_pendiente CHECK (cantidad_pendiente >= 0 AND cantidad_pendiente <= cantidad_total),
  CONSTRAINT chk_precio_unitario CHECK (precio_unitario >= 0)
);

CREATE TABLE IF NOT EXISTS diario_inventario (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  articulo_id         UUID NOT NULL REFERENCES o_articulos(id),
  almacen_id          VARCHAR(20) NOT NULL REFERENCES o_almacenes(id),
  doc_referencia_id   UUID NOT NULL REFERENCES compras_encabezado(id),
  tipo_movimiento     VARCHAR(3) NOT NULL,
  cantidad            NUMERIC(18,4) NOT NULL,
  costo_momento       NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
  usuario_id          UUID NOT NULL REFERENCES o_usuarios(id),
  fecha               TIMESTAMP NOT NULL DEFAULT NOW(),
  comentario          TEXT,
  CONSTRAINT chk_tipo_movimiento CHECK (tipo_movimiento IN ('IN','OUT')),
  CONSTRAINT chk_cantidad_diario CHECK (cantidad >= 0)
);

CREATE TABLE IF NOT EXISTS cxp_cuentas_por_pagar (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id           UUID NOT NULL REFERENCES compras_encabezado(id) ON DELETE CASCADE,
  proveedor_id        UUID NOT NULL REFERENCES o_proveedores(id),
  numero_factura      VARCHAR(50) NOT NULL,
  monto_total         NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  saldo_pendiente     NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  fecha_vencimiento   DATE NOT NULL,
  estado              VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_cxp_factura UNIQUE (proveedor_id, numero_factura),
  CONSTRAINT chk_cxp_monto_total CHECK (monto_total >= 0),
  CONSTRAINT chk_cxp_saldo_pendiente CHECK (saldo_pendiente >= 0 AND saldo_pendiente <= monto_total),
  CONSTRAINT chk_cxp_estado CHECK (estado IN ('PENDIENTE', 'PARCIAL', 'PAGADA', 'ANULADA'))
);

CREATE TABLE IF NOT EXISTS cxp_pagos_proveedor (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuenta_por_pagar_id UUID NOT NULL REFERENCES cxp_cuentas_por_pagar(id) ON DELETE CASCADE,
  proveedor_id        UUID NOT NULL REFERENCES o_proveedores(id),
  monto               NUMERIC(18,2) NOT NULL,
  fecha_pago          TIMESTAMP NOT NULL,
  referencia          VARCHAR(100),
  created_by          UUID NOT NULL REFERENCES o_usuarios(id),
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_pago_monto CHECK (monto > 0)
);

CREATE TABLE IF NOT EXISTS auditoria_eventos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      UUID NOT NULL REFERENCES o_usuarios(id),
  entidad         VARCHAR(50) NOT NULL,
  entidad_id      UUID,
  accion          VARCHAR(30) NOT NULL,
  datos_antes     TEXT,
  datos_despues   TEXT,
  ip_origen       VARCHAR(50),
  fecha           TIMESTAMP NOT NULL DEFAULT NOW()
);
