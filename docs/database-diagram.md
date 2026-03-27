# Diagrama de Base de Datos

```mermaid
erDiagram
  o_roles ||--o{ o_usuarios : asigna
  o_usuarios ||--o{ auth_refresh_tokens : genera
  o_usuarios ||--o{ auth_2fa_codes : solicita
  o_monedas ||--o{ o_proveedores : usa
  o_grupos_articulo ||--o{ o_articulos : clasifica
  o_impuestos ||--o{ o_articulos : grava
  o_tipos_documento ||--o{ compras_encabezado : define
  o_estados_documento ||--o{ compras_encabezado : controla
  o_monedas ||--o{ compras_encabezado : expresa
  o_proveedores ||--o{ compras_encabezado : recibe
  o_usuarios ||--o{ compras_encabezado : crea
  compras_encabezado ||--o{ compras_detalle : contiene
  o_articulos ||--o{ compras_detalle : referencia
  o_almacenes ||--o{ compras_detalle : almacena
  o_impuestos ||--o{ compras_detalle : calcula

  o_roles {
    int id PK
    string codigo
    string nombre
  }

  o_usuarios {
    uuid id PK
    string username
    string nombre_completo
    string email
    text password_hash
    int rol_id FK
    boolean activo
    boolean two_factor_enabled
  }

  auth_refresh_tokens {
    uuid id PK
    uuid usuario_id FK
    text token_hash
    timestamp expires_at
    timestamp revoked_at
  }

  auth_2fa_codes {
    uuid id PK
    uuid usuario_id FK
    string codigo_hash
    string canal
    timestamp expires_at
    timestamp used_at
  }

  o_proveedores {
    uuid id PK
    string card_code
    string card_name
    string nit_rut
    int moneda_id FK
    numeric linea_credito
    boolean activo
  }

  o_articulos {
    uuid id PK
    string item_code
    string item_name
    int grupo_id FK
    int impuesto_id FK
    numeric costo_estandar
    boolean activo
  }

  compras_encabezado {
    uuid id PK
    int tipo_doc_id FK
    int doc_num
    uuid proveedor_id FK
    int estado_id FK
    int moneda_id FK
    date fecha_documento
    numeric subtotal
    numeric descuento_total
    numeric impuestos_total
    numeric total_documento
    uuid created_by FK
  }

  compras_detalle {
    uuid id PK
    uuid doc_id FK
    int line_num
    uuid articulo_id FK
    string almacen_id FK
    int impuesto_id FK
    numeric cantidad_total
    numeric precio_unitario
    numeric descuento_linea
    numeric subtotal_linea
    numeric total_linea
  }
```

## Notas de defensa

- El modelo es relacional y esta normalizado alrededor de catalogos maestros.
- `compras_encabezado` y `compras_detalle` representan el documento de compra y sus lineas.
- `auth_refresh_tokens` y `auth_2fa_codes` permiten seguridad avanzada sin mezclar esos datos con la tabla de usuarios.
- Los catalogos `o_monedas`, `o_impuestos`, `o_grupos_articulo`, `o_tipos_documento` y `o_estados_documento` simplifican validaciones y demostracion.
