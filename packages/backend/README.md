# Backend ERP

## Run

```bash
bun install
bun run dev
```

## Database workflow

```bash
bun run db:reset
bun run db:migrate
bun run db:seed
bun run db:smoke
```

Orden recomendado para una base vacia:

1. `bun run db:reset`
2. `bun run db:migrate`
3. `bun run db:seed`
4. `bun run db:smoke`

## Environment

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `EXPOSE_2FA_CODE`
- `GOOGLE_CLIENT_ID`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `TWO_FACTOR_EMAIL_OVERRIDE`
- `DEMO_USER_USERNAME`
- `DEMO_USER_NAME`
- `DEMO_USER_EMAIL`
- `DEMO_USER_PASSWORD`
- `DEMO_USER_ROLE_ID`
- `DEMO_USER_2FA_ENABLED`

## Entorno local recomendado

Usa [`packages/backend/.env.local`](/home/naomi/erp-final/packages/backend/.env.local) para desarrollo local con PostgreSQL publicado en `localhost:5433`.

## Endpoints disponibles

- `GET /docs`
- `GET /openapi.json`
- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/verify-2fa`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/usuarios`
- `GET /api/proveedores`
- `GET /api/proveedores/:id`
- `POST /api/proveedores`
- `PUT /api/proveedores/:id`
- `DELETE /api/proveedores/:id`
- `GET /api/articulos`
- `GET /api/articulos/:id`
- `POST /api/articulos`
- `PUT /api/articulos/:id`
- `DELETE /api/articulos/:id`
- `GET /api/ordenes-compra`
- `GET /api/ordenes-compra/:id`
- `POST /api/ordenes-compra`
- `PUT /api/ordenes-compra/:id`
- `DELETE /api/ordenes-compra/:id`

## Roles del modulo

- `ADMIN`: acceso total a usuarios, proveedores, articulos y ordenes.
- `COMPRAS`: acceso operativo a proveedores, articulos y ordenes de compra.
- `SUPERVISOR`: acceso de lectura a proveedores, articulos y ordenes.
- `ALMACEN`: acceso de lectura a articulos y ordenes.

## Flujo de autenticacion

1. Registrar usuario.
2. Hacer login con email y password.
3. Recibir `challengeId` y, en entorno de desarrollo, `previewCode`.
4. Confirmar el segundo factor en `POST /api/auth/verify-2fa`.
5. Usar `accessToken` en `Authorization: Bearer <token>`.

## 2FA por correo con Gmail

1. Configurar una cuenta emisora en Gmail con contrasena de aplicacion.
2. Definir `SMTP_HOST=smtp.gmail.com`.
3. Definir `SMTP_PORT=587` y `SMTP_SECURE=false`.
4. Definir `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM`.
5. Si quieres que todos los codigos lleguen a un correo de pruebas, usa `TWO_FACTOR_EMAIL_OVERRIDE`.
6. Cuando el envio por correo ya funcione, cambia `EXPOSE_2FA_CODE=false`.

## Demo y defensa

- Guion de demo: [docs/backend-demo.md](/home/naomi/erp-final/docs/backend-demo.md)
- Diagrama de BD: [docs/database-diagram.md](/home/naomi/erp-final/docs/database-diagram.md)
- Scrum en Azure DevOps: [docs/azure-devops-scrum.md](/home/naomi/erp-final/docs/azure-devops-scrum.md)
- Arquitectura backend: [ARCHITECTURE.md](/home/naomi/erp-final/packages/backend/src/ARCHITECTURE.md)
- Usuarios demo por rol: `admin@erp.local`, `compras@erp.local`, `almacen@erp.local`, `supervisor@erp.local`

## Flujo Google/Gmail

1. Configurar `GOOGLE_CLIENT_ID` en backend.
2. Obtener `credential` desde Google Sign-In en frontend.
3. Enviar `credential` a `POST /api/auth/google`.
4. El backend valida el `idToken` y emite sesion local del ERP.
