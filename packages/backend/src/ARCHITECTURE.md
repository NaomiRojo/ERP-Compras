## Arquitectura elegida

El backend del ERP de compras sigue **Onion Architecture** con apoyo de **Repository**, **Use Cases** y **Unit of Work** sobre **TypeORM** y **PostgreSQL**.

La razon principal de esta decision es separar claramente:

- reglas del negocio
- casos de uso del modulo
- detalles tecnicos de persistencia y transporte HTTP

Con esto el equipo puede probar la logica sin depender directamente del framework HTTP ni del motor de base de datos.

## Capas

- `domain`: entidades del negocio y contratos de repositorio.
- `application`: DTOs, interfaces transversales y casos de uso.
- `infrastructure`: persistencia PostgreSQL, TypeORM, JWT, SMTP, hashing y logging.
- `presentation`: handlers HTTP, serializadores, middlewares y contratos de dependencias HTTP.
- `main`: composicion de dependencias, bootstrap y arranque del servidor.

Regla principal: las dependencias siempre apuntan hacia adentro.

## Flujo de una peticion

Ejemplo: `POST /api/ordenes-compra`

1. El handler HTTP recibe la request y parsea el body.
2. El middleware valida el JWT cuando la ruta es protegida.
3. `main/app.ts` enruta la request usando handlers creados con dependencias inyectadas.
4. `main/container.ts` construye el contexto de la operacion sin exponer repositorios concretos a `presentation`.
5. El caso de uso ejecuta validaciones y reglas del modulo.
6. Los repositorios persisten con TypeORM dentro de un `UnitOfWork`.
7. El serializer prepara la respuesta JSON.

## Persistencia y base de datos

- `src/infrastructure/persistence/postgres/init` contiene SQL versionado para extensiones, esquema, indices y catalogos base.
- `src/infrastructure/persistence/postgres/migrations` expone una migracion TypeORM que ejecuta esos SQL de forma formal para el examen.
- `src/infrastructure/persistence/postgres/scripts` centraliza `db:reset`, `db:migrate`, `db:seed` y `db:smoke`.
- `src/infrastructure/persistence/postgres/orm/data-source.ts` ahora expone una fabrica lazy de `DataSource`; importar modulos ya no dispara errores por configuracion faltante.
- `synchronize` se mantiene en `false`; la base no se genera automaticamente por ORM.

## Modulo de compras cubierto

Para este examen el alcance defendible del modulo es:

- autenticacion y usuarios
- proveedores
- articulos
- ordenes de compra

Los siguientes flujos quedan como backlog siguiente:

- aprobacion de orden
- recepcion
- factura de proveedor
- pago a proveedor

## Convenciones del proyecto

- La fuente de verdad de persistencia vive en `src/infrastructure/persistence/postgres`.
- Los casos de uso en `application/use-cases` deben estar conectados a flujo real.
- Los handlers HTTP no contienen logica de negocio.
- La persistencia se realiza via repositorios y no desde handlers.
- `presentation` no importa `main`; `main` crea la aplicacion con `createApp(...)`.
- `src/main/bootstrap.ts` es el unico punto que arranca el servidor de forma ejecutable.
- La autorizacion por roles se resuelve en HTTP con reglas centralizadas por ruta y metodo, usando el `roleId` del JWT.
