## Onion Architecture

- `domain`: entidades y contratos del dominio.
- `application`: casos de uso, DTOs e interfaces transversales.
- `infrastructure`: persistencia PostgreSQL, ORM, JWT, logs y auditoria.
- `presentation`: rutas HTTP, controladores, middlewares y validaciones.
- `main`: composicion de dependencias y arranque.

Regla principal: las dependencias siempre apuntan hacia adentro.
