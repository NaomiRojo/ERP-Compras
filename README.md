# ERP Proyecto Auxiliar

Backend y frontend de un ERP académico con enfoque en compras, proveedores, inventario y pagos.

## Stack

- Frontend: React + Bun
- Backend: TypeScript + Bun
- Base de datos: PostgreSQL
- Infraestructura: Docker Compose
- Arquitectura backend: Onion Architecture + Repository + Use Cases + DTO + Unit of Work

## Estado actual

El proyecto ya cuenta con una base funcional de backend y entorno Docker. El frontend todavía está en fase inicial.

### Implementado

- Onion Architecture en `packages/backend/src`
- conexión real a PostgreSQL
- `docker-compose.yml` funcional para `db`, `backend` y `frontend`
- autenticación con registro, login, refresh token y JWT
- segundo factor `2FA`
- envío de código `2FA` por correo con SMTP/Gmail
- login con Google/Gmail
- Swagger/OpenAPI
- CRUD de proveedores
- CRUD de artículos
- CRUD de órdenes de compra
- listado de usuarios
- pruebas unitarias iniciales del backend

### Pendiente

- frontend funcional en React
- persistencia de sesión en frontend
- flujos ERP completos:
  - aprobar orden de compra
  - registrar recepción
  - registrar factura
  - registrar pago
- roles y autorización por permisos
- más pruebas unitarias e integración
- documento formal de arquitectura
- diagrama de base de datos para exposición

## Avance del 22-03-2026

Durante esta jornada se realizó lo siguiente:

- limpieza de archivos y carpetas basura heredadas
- reorganización del backend a Onion Architecture real
- integración de Swagger en `http://localhost:4000/docs`
- unificación del flujo de autenticación
- reutilización del auth útil y eliminación del auth legacy que ya no servía
- integración de login con Google/Gmail
- integración de `2FA` con envío por correo SMTP
- configuración para redirigir el correo 2FA a `jhovannyalave@gmail.com` en entorno de prueba
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
- `presentation`: API HTTP, middlewares y OpenAPI
- `main`: composición de dependencias y arranque

Regla principal: las dependencias apuntan hacia adentro.

Referencia:
- [ARCHITECTURE.md](/home/jhova/Erp-Proyecto-auxiliar_pruebas/packages/backend/src/ARCHITECTURE.md)

## Cómo levantar el proyecto

### Opción recomendada: Docker

```bash
docker compose up --build
```

Servicios:

- backend: `http://localhost:4000`
- swagger: `http://localhost:4000/docs`
- frontend: `http://localhost:3000`
- postgres: `localhost:5432`

### Desarrollo local

Raíz del proyecto:

```bash
bun install
```

Backend:

```bash
cd packages/backend
bun install
bun run dev
```

Frontend:

```bash
cd packages/frontend
bun install
bun run dev
```

## Variables importantes del backend

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `GOOGLE_CLIENT_ID`
- `EXPOSE_2FA_CODE`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `TWO_FACTOR_EMAIL_OVERRIDE`

## Autenticación y 2FA

Flujo actual:

1. Registrar usuario con `POST /api/auth/register`
2. Iniciar sesión con `POST /api/auth/login`
3. Si el usuario tiene `2FA`, el backend devuelve `challengeId`
4. El código llega por correo o, en desarrollo, por `previewCode`
5. Confirmar con `POST /api/auth/verify-2fa`
6. Usar `accessToken` para consumir rutas protegidas

Para Gmail SMTP:

- activar verificación en 2 pasos en la cuenta Google
- generar una `App Password`
- usar esa clave como `SMTP_PASS`

Mientras el correo esté en pruebas:

- `TWO_FACTOR_EMAIL_OVERRIDE=jhovannyalave@gmail.com`

Cuando el correo ya funcione correctamente:

- cambiar `EXPOSE_2FA_CODE=false`

## Endpoints disponibles

### Salud y documentación

- `GET /health`
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
- `PUT /api/ordenes-compra/:id`
- `DELETE /api/ordenes-compra/:id`

## Pruebas

El backend ya tiene pruebas unitarias iniciales para:

- registro de usuarios
- login con Google
- sesión y segundo factor
- listado de usuarios
- creación de proveedores

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

## Referencias internas

- [README backend](/home/jhova/Erp-Proyecto-auxiliar_pruebas/packages/backend/README.md)
- [App principal backend](/home/jhova/Erp-Proyecto-auxiliar_pruebas/packages/backend/src/main/app.ts)
- [Contenedor de dependencias](/home/jhova/Erp-Proyecto-auxiliar_pruebas/packages/backend/src/main/container.ts)
