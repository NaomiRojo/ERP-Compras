# ERP Proyecto Modulo de Compras

Backend y frontend de un ERP académico con enfoque en compras, proveedores, inventario y pagos.

## Stack

- Frontend: React + Bun
- Backend: TypeScript + Bun
- Base de datos: PostgreSQL
- Infraestructura: Docker Compose
- Arquitectura backend: Onion Architecture + Repository + Use Cases + DTO + Unit of Work

## Estado actual

El proyecto cuenta con backend y frontend funcionales para presentar el módulo ERP de compras. La SPA consume APIs REST reales, protege rutas por sesión/rol, maneja token JWT con interceptor HTTP y cubre login, dashboard, CRUD, reportes y pruebas unitarias.

### Implementado

- Onion Architecture en `packages/backend/src`
- conexión real a PostgreSQL
- `docker-compose.yml` funcional para `db`, `backend` y `frontend`
- migraciones formales con TypeORM usando los SQL versionados del proyecto
- seed de demo para usuario, proveedor y artículo
- autenticación con registro, login, refresh token y JWT
- segundo factor `2FA`
- autorización por roles en rutas del módulo de compras
- envío de código `2FA` por correo con SMTP/Gmail
- login con Google/Gmail
- Swagger/OpenAPI
- CRUD de proveedores
- CRUD de artículos
- CRUD de órdenes de compra
- frontend SPA en React con login, 2FA, dashboard y layout ERP responsivo
- persistencia de sesión en `localStorage`/`sessionStorage` con expiración por inactividad
- interceptor HTTP para inyectar `Authorization: Bearer <token>`
- CRUD frontend de proveedores, artículos y órdenes de compra con validaciones de formulario
- reportes operativos con filtros, gráficos SVG, alertas, exportación CSV e impresión/PDF
- pruebas unitarias frontend con Bun Testing Library y reporte de cobertura
- listado de usuarios
- pruebas unitarias iniciales del backend

### Pendiente

- prototipo visual final en Figma para anexar al examen
- endurecer escenarios productivos de despliegue y monitoreo
- permisos granulares para futuros flujos de aprobación, recepción y pago
- más pruebas de integración

## Avance del 22-03-2026

Durante esta jornada se realizó lo siguiente:

- limpieza de archivos y carpetas basura heredadas
- reorganización del backend a Onion Architecture real
- integración de Swagger en `http://localhost:4000/docs`
- unificación del flujo de autenticación
- reutilización del auth útil y eliminación del auth legacy que ya no servía
- integración de login con Google/Gmail
- integración de `2FA` con envío por correo SMTP
- configuración para redirigir el correo 2FA a una cuenta de pruebas del equipo
- creación de `GET /api/usuarios`
- validación de tests y typecheck del backend

## Estructura del proyecto

```txt
.
├── docker-compose.yml
├── package.json
├── bun.lock
├── bun.nix
├── flake.nix
├── packages
│   ├── backend
│   │   ├── package.json
│   │   ├── bun.lock
│   │   └── src
│   │       ├── domain
│   │       ├── application
│   │       ├── infrastructure
│   │       ├── presentation
│   │       └── main
│   └── frontend
│       └── src
```

## Arquitectura backend

La arquitectura del backend sigue Onion:

- `domain`: entidades y contratos del negocio
- `application`: DTOs, interfaces y casos de uso
- `infrastructure`: PostgreSQL, TypeORM, JWT, SMTP, logging
- `presentation`: API HTTP, middlewares, serializadores y contratos de dependencias HTTP
- `main`: composición de dependencias, bootstrap y arranque

Regla principal: las dependencias apuntan hacia adentro.

Referencia:
- [ARCHITECTURE.md](/home/naomi/erp-final/packages/backend/src/ARCHITECTURE.md)
- [database-diagram.md](/home/naomi/erp-final/docs/database-diagram.md)
- [backend-demo.md](/home/naomi/erp-final/docs/backend-demo.md)
- [azure-devops-scrum.md](/home/naomi/erp-final/docs/azure-devops-scrum.md)

## Cómo levantar el proyecto

### Opción recomendada: Docker

```bash
docker compose up --build
```

Si tu instalación de Docker falla por `docker-buildx` faltante, usa:

```bash
DOCKER_BUILDKIT=0 docker compose up --build
```

Servicios:

- backend: `http://localhost:4000`
- swagger: `http://localhost:4000/docs`
- frontend: `http://localhost:3000`
- postgres: `localhost:5433`
- al iniciar por Docker, el backend corre `db:migrate`; el `seed` de demo sigue siendo manual

#### Migraciones con Docker

Si el backend ya está arriba:

```bash
docker compose exec backend bun run db:migrate
```

Si quieres correr migración en un contenedor one-shot:

```bash
docker compose up -d db
docker compose run --rm backend sh -lc "bun install && bun run db:migrate"
```

### Desarrollo local

Raíz del proyecto:

```bash
bun install
```

Backend:

```bash
cd packages/backend
bun install
bun run db:reset
bun run db:migrate
bun run db:seed
bun run dev
```

Frontend:

```bash
cd packages/frontend
bun install
bun run dev
```

Archivos de entorno recomendados:

- raíz: [`.env`](/home/naomi/erp-final/.env) para Docker Compose
- backend local: [`packages/backend/.env.local`](/home/naomi/erp-final/packages/backend/.env.local)
- frontend local: [`packages/frontend/.env.local`](/home/naomi/erp-final/packages/frontend/.env.local)

Conexión local esperada:

- backend local en `http://localhost:4000`
- frontend local en `http://localhost:3000`
- frontend usa `BUN_PUBLIC_API_URL=http://localhost:4000`
- backend local usa `DATABASE_URL=postgres://erp_user:erp_password@localhost:5433/erp`

## Variables importantes del backend

- `DATABASE_URL`
- `JWT_SECRET` (obligatorio y seguro en `NODE_ENV=production`)
- `CORS_ORIGINS`
- `CORS_ALLOW_CREDENTIALS` (por defecto `false`)
- `GOOGLE_CLIENT_ID`
- `EXPOSE_2FA_CODE`
- `TWO_FACTOR_DEFAULT_CHANNEL` (`EMAIL`, `SMS`, `WHATSAPP` o `VOICE`)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `TWO_FACTOR_EMAIL_OVERRIDE`
- `TWO_FACTOR_PHONE_OVERRIDE`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_PHONE`
- `TWILIO_WHATSAPP_CONTENT_SID`

## Autenticación y 2FA

Flujo actual:

1. Registrar usuario con `POST /api/auth/register`
2. Iniciar sesión con `POST /api/auth/login` (opcional: `twoFactorChannel` y `twoFactorPhoneNumber`)
3. Si el usuario tiene `2FA`, el backend devuelve `challengeId`
4. El código llega por correo, SMS, WhatsApp o llamada; en desarrollo también por `previewCode`
5. Confirmar con `POST /api/auth/verify-2fa`
6. Usar `accessToken` para consumir rutas protegidas

Para Gmail SMTP:

- activar verificación en 2 pasos en la cuenta Google
- generar una `App Password`
- usar esa clave como `SMTP_PASS`

Mientras el correo esté en pruebas:

- `TWO_FACTOR_EMAIL_OVERRIDE=qa-2fa@erp.local`

Cuando el correo ya funcione correctamente:

- cambiar `EXPOSE_2FA_CODE=false`

Para SMS, WhatsApp o llamada con Twilio:

- configurar `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y `TWILIO_FROM_PHONE`
- enviar `twoFactorPhoneNumber` en login (o usar `TWO_FACTOR_PHONE_OVERRIDE`)
- opcional: definir `TWO_FACTOR_DEFAULT_CHANNEL=SMS`, `WHATSAPP` o `VOICE`
- si `TWILIO_FROM_PHONE` empieza con `whatsapp:`, usa `WHATSAPP` y asegúrate de haber unido tu número al Sandbox de Twilio con `join <codigo>`
- si el mensaje inicia la conversacion en WhatsApp, definir `TWILIO_WHATSAPP_CONTENT_SID` con la plantilla aprobada de verificacion

## Endpoints disponibles

### Salud y documentación

- `GET /health`
- `GET /ready`
- `GET /openapi.json`
- `GET /docs`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/verify-2fa`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### Usuarios

- `GET /api/usuarios`

### Catálogos

- `GET /api/catalogos/roles`
- `GET /api/catalogos/monedas`
- `GET /api/catalogos/impuestos`
- `GET /api/catalogos/grupos-articulo`
- `GET /api/catalogos/almacenes`
- `GET /api/catalogos/estados-documento`
- `GET /api/catalogos/tipos-documento`

### Proveedores

- `GET /api/proveedores`
- `GET /api/proveedores/:id`
- `POST /api/proveedores`
- `PUT /api/proveedores/:id`
- `DELETE /api/proveedores/:id`

### Artículos

- `GET /api/articulos`
- `GET /api/articulos/:id`
- `POST /api/articulos`
- `PUT /api/articulos/:id`
- `DELETE /api/articulos/:id`

### Órdenes de compra

- `GET /api/ordenes-compra`
- `GET /api/ordenes-compra/:id`
- `POST /api/ordenes-compra`
- `POST /api/ordenes-compra/:id/aprobar`
- `POST /api/ordenes-compra/:id/recepciones`
- `PUT /api/ordenes-compra/:id`
- `DELETE /api/ordenes-compra/:id`

### Cuentas por pagar y pagos

- `GET /api/cuentas-por-pagar`
- `GET /api/cuentas-por-pagar/:id`
- `POST /api/cuentas-por-pagar`
- `POST /api/cuentas-por-pagar/:id/pagos`
- `GET /api/pagos-proveedor`
- `GET /api/pagos-proveedor/:id`

### Inventario y auditoría

- `GET /api/inventario/stocks`
- `GET /api/inventario/movimientos`
- `GET /api/inventario/movimientos/:id`
- `GET /api/auditoria`
- `GET /api/auditoria/:id`

## Pruebas

El backend ya tiene pruebas unitarias iniciales para:

- registro de usuarios
- login con email y password
- login con Google
- sesión y segundo factor
- refresh token
- listado de usuarios
- creación y actualización de proveedores
- CRUD base de artículos
- cálculo y actualización de órdenes de compra

Ejecutar:

```bash
cd packages/backend
bun test
```

## Verificación realizada

Se validó:

- arranque del backend en Docker
- respuesta `GET /health`
- `bun test`
- `bunx tsc --noEmit -p tsconfig.json`

## Notas importantes

- el frontend todavía no consume la API de usuarios ni persiste sesión
- los usuarios sí se guardan en PostgreSQL; si no aparecen tras recargar, el problema actual está en frontend, no en la BD
- Swagger es la forma más rápida de probar el backend en esta etapa

## Guía de CI/CD para Frontend

- Deploy con Azure Static Web Apps + agente self-hosted Windows en `docs/AZURE-STATIC-WEBAPP-AGENT-SETUP.md`.

## Referencias internas

- [README backend](/home/naomi/erp-final/packages/backend/README.md)
- [App principal backend](/home/naomi/erp-final/packages/backend/src/main/app.ts)
- [Contenedor de dependencias](/home/naomi/erp-final/packages/backend/src/main/container.ts)
