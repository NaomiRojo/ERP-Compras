INSERT INTO o_roles (id, codigo, nombre) VALUES
  (1, 'ADMIN', 'Administrador'),
  (2, 'COMPRAS', 'Compras'),
  (3, 'ALMACEN', 'Almacén'),
  (4, 'SUPERVISOR', 'Supervisor')
ON CONFLICT (id) DO NOTHING;

INSERT INTO o_monedas (id, codigo, nombre, tasa_actual) VALUES
  (1, 'BOB', 'Boliviano', 1.0000),
  (2, 'USD', 'Dólar estadounidense', 6.9600)
ON CONFLICT (id) DO NOTHING;

INSERT INTO o_impuestos (id, tax_code, nombre, porcentaje, activo) VALUES
  (1, 'IVA13', 'IVA 13%', 13.00, TRUE),
  (2, 'EXE', 'Exento', 0.00, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO o_grupos_articulo (id, codigo, nombre) VALUES
  (1, 'MAT', 'Materiales'),
  (2, 'INS', 'Insumos'),
  (3, 'REP', 'Repuestos')
ON CONFLICT (id) DO NOTHING;

INSERT INTO o_almacenes (id, nombre, ubicacion, activo) VALUES
  ('ALM-01', 'Almacén Central', 'Sucursal principal', TRUE),
  ('ALM-02', 'Almacén Secundario', 'Sucursal auxiliar', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO o_estados_documento (id, codigo, nombre) VALUES
  (1, 'BORRADOR', 'Borrador'),
  (2, 'ABIERTO', 'Abierto'),
  (3, 'CERRADO', 'Cerrado'),
  (4, 'ANULADO', 'Anulado'),
  (5, 'APROBADO', 'Aprobado')
ON CONFLICT (id) DO NOTHING;

INSERT INTO o_tipos_documento (id, codigo, nombre, afecta_inventario) VALUES
  (1, 'SOL', 'Solicitud de compra', FALSE),
  (2, 'PED', 'Pedido de compra', FALSE),
  (3, 'ENT', 'Entrada de mercadería', TRUE),
  (4, 'FAC', 'Factura de proveedor', FALSE)
ON CONFLICT (id) DO NOTHING;