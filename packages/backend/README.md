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
- `JWT_SECRET` (obligatorio y seguro en `NODE_ENV=production`)
- `CORS_ORIGINS`
- `CORS_ALLOW_CREDENTIALS` (por defecto `false`)
- `EXPOSE_2FA_CODE`
- `TWO_FACTOR_DEFAULT_CHANNEL` (`EMAIL`, `SMS`, `WHATSAPP` o `VOICE`)
- `GOOGLE_CLIENT_ID`
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
- `GET /ready`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/verify-2fa`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/usuarios`
- `GET /api/catalogos/roles`
- `GET /api/catalogos/monedas`
- `GET /api/catalogos/impuestos`
- `GET /api/catalogos/grupos-articulo`
- `GET /api/catalogos/almacenes`
- `GET /api/catalogos/estados-documento`
- `GET /api/catalogos/tipos-documento`
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
- `POST /api/ordenes-compra/:id/aprobar`
- `POST /api/ordenes-compra/:id/recepciones`
- `PUT /api/ordenes-compra/:id`
- `DELETE /api/ordenes-compra/:id`
- `GET /api/cuentas-por-pagar`
- `GET /api/cuentas-por-pagar/:id`
- `POST /api/cuentas-por-pagar`
- `POST /api/cuentas-por-pagar/:id/pagos`
- `GET /api/pagos-proveedor`
- `GET /api/pagos-proveedor/:id`
- `GET /api/inventario/stocks`
- `GET /api/inventario/movimientos`
- `GET /api/inventario/movimientos/:id`
- `GET /api/auditoria`
- `GET /api/auditoria/:id`

## Roles del modulo

- `ADMIN`: acceso total al modulo, incluyendo auditoria.
- `COMPRAS`: acceso operativo a proveedores, articulos, ordenes, cuentas por pagar y pagos.
- `SUPERVISOR`: acceso de lectura a compras, CxP, pagos y auditoria.
- `ALMACEN`: acceso de lectura a articulos, ordenes e inventario, y registro de recepciones.

## Flujo de autenticacion

1. Registrar usuario.
2. Hacer login con email y password (opcional: `twoFactorChannel` y `twoFactorPhoneNumber`).
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

## 2FA por SMS, WhatsApp o llamada (Twilio)

1. Crear numero emisor en Twilio.
2. Definir `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y `TWILIO_FROM_PHONE` (formato E.164).
3. En login enviar `twoFactorChannel: "SMS"`, `twoFactorChannel: "WHATSAPP"` o `twoFactorChannel: "VOICE"`.
4. Enviar `twoFactorPhoneNumber` en login, o definir `TWO_FACTOR_PHONE_OVERRIDE` para pruebas.
5. Si quieres que el canal telefonico sea el predeterminado, define `TWO_FACTOR_DEFAULT_CHANNEL=SMS`, `WHATSAPP` o `VOICE`.
6. Si `TWILIO_FROM_PHONE` empieza con `whatsapp:`, usa `WHATSAPP`. En Sandbox, el usuario debe enviar `join <codigo>` a `whatsapp:+14155238886` y volver a unirse cada 3 dias.
7. Si el mensaje de WhatsApp inicia la conversacion, define `TWILIO_WHATSAPP_CONTENT_SID` con una plantilla aprobada de verificacion.

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
