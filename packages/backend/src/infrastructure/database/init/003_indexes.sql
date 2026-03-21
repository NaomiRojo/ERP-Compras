CREATE INDEX IF NOT EXISTS idx_usuarios_email
  ON o_usuarios(email);

CREATE INDEX IF NOT EXISTS idx_usuarios_username
  ON o_usuarios(username);

CREATE INDEX IF NOT EXISTS idx_proveedores_card_code
  ON o_proveedores(card_code);

CREATE INDEX IF NOT EXISTS idx_articulos_item_code
  ON o_articulos(item_code);

CREATE INDEX IF NOT EXISTS idx_compras_encabezado_proveedor
  ON compras_encabezado(proveedor_id);

CREATE INDEX IF NOT EXISTS idx_compras_encabezado_tipo_doc
  ON compras_encabezado(tipo_doc_id);

CREATE INDEX IF NOT EXISTS idx_compras_detalle_doc
  ON compras_detalle(doc_id);

CREATE INDEX IF NOT EXISTS idx_compras_detalle_articulo
  ON compras_detalle(articulo_id);

CREATE INDEX IF NOT EXISTS idx_diario_inventario_articulo
  ON diario_inventario(articulo_id);

CREATE INDEX IF NOT EXISTS idx_diario_inventario_doc
  ON diario_inventario(doc_referencia_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_usuario
  ON auth_refresh_tokens(usuario_id);

CREATE INDEX IF NOT EXISTS idx_2fa_usuario
  ON auth_2fa_codes(usuario_id);