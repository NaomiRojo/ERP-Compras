## Onion Architecture

- `domain`: entidades y contratos del dominio.
- `application`: casos de uso, DTOs e interfaces transversales.
- `infrastructure`: persistencia PostgreSQL, ORM, JWT, logs y auditoria.
- `presentation`: rutas HTTP, controladores, middlewares y validaciones.
- `main`: composicion de dependencias y arranque.

Regla principal: las dependencias siempre apuntan hacia adentro.

## Convenciones del proyecto

- La unica fuente de verdad para persistencia es `src/infrastructure/persistence/postgres`.
- La inicializacion SQL de Docker debe mantenerse en `src/infrastructure/persistence/postgres/init`.
- En `application/use-cases` solo deben vivir casos de uso implementados y conectados al flujo actual.
