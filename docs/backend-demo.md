# Demo Backend ERP Compras

## 1. Levantar servicios

```bash
docker compose up --build -d
```

Si `docker-buildx` falla:

```bash
DOCKER_BUILDKIT=0 docker compose up --build -d
```

Nota:

- el contenedor `backend` ejecuta `db:migrate` al iniciar
- el `seed` de demo sigue siendo manual para la presentacion

## 2. Preparar base de datos

```bash
cd packages/backend
bun run db:reset
bun run db:migrate
bun run db:seed
bun run db:smoke
```

## 3. Datos de demo

- Usuarios demo: se imprimen al ejecutar `db:seed`
- `admin@erp.local / Admin123*`
- `compras@erp.local / Compras123*`
- `almacen@erp.local / Almacen123*`
- `supervisor@erp.local / Supervisor123*`
- Si `TWO_FACTOR_EMAIL_OVERRIDE` esta definido, el correo 2FA se redirige a ese email
- `openapi.json` puede importarse en Postman para generar la coleccion

## 4. Flujo en Postman

1. `GET /health`
2. `POST /api/auth/login`
3. Revisar el correo 2FA real
4. `POST /api/auth/verify-2fa`
5. Copiar `accessToken`
6. `GET /api/auth/me`
7. CRUD `proveedores`
8. CRUD `articulos`
9. CRUD `ordenes-compra`
10. `POST /api/auth/refresh`

## 4.1. Roles para demostrar

- `ADMIN`: puede consultar `GET /api/usuarios`
- `COMPRAS`: puede crear y editar proveedores, articulos y ordenes
- `ALMACEN`: puede leer articulos y ordenes, pero no crear ordenes
- `SUPERVISOR`: puede revisar informacion, pero no modificar maestros

## 5. Puntos para remarcar en la defensa

- La BD se reconstruye desde cero con migraciones y seed
- Docker ya no inicializa la BD con SQL montados en `postgres`; la ruta oficial es TypeORM
- Docker aísla backend y PostgreSQL
- TypeORM se usa con `EntitySchema`, `Repository` y `UnitOfWork`
- El backend expone OpenAPI y se prueba con Postman o Swagger
- El login esta protegido por JWT y segundo factor por email
