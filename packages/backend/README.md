# Backend ERP

## Run

```bash
bun install
bun run dev
```

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

## Flujo Google/Gmail

1. Configurar `GOOGLE_CLIENT_ID` en backend.
2. Obtener `credential` desde Google Sign-In en frontend.
3. Enviar `credential` a `POST /api/auth/google`.
4. El backend valida el `idToken` y emite sesion local del ERP.
