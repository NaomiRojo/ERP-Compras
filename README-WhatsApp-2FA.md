# README WhatsApp 2FA

## Objetivo

Documentar y dejar lista la configuracion esencial para habilitar, reforzar y validar el envio de codigos de segundo factor por WhatsApp usando Twilio.

## Archivos tocados

- `.env.example`
- `packages/backend/.env.local.example`
- `packages/backend/src/main/container.ts`
- `packages/backend/src/infrastructure/auth/TwilioTwoFactorPhoneService.ts`
- `packages/backend/src/infrastructure/auth/TwilioTwoFactorPhoneService.spec.ts`
- `packages/frontend/tsconfig.json`

## Cambios principales

### 1. Configuracion base de entorno

Se dejo preparada la configuracion ejemplo para pruebas por WhatsApp:

- `TWO_FACTOR_DEFAULT_CHANNEL=WHATSAPP`
- `TWILIO_FROM_PHONE=whatsapp:+14155238886`
- `TWILIO_WHATSAPP_CONTENT_SID=` como opcion para mensajes de negocio con plantilla aprobada
- `GOOGLE_CLIENT_ID=` mantenido como variable disponible en ejemplos

En `packages/backend/src/main/container.ts` el contenedor ya inyecta:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_PHONE`
- `TWILIO_WHATSAPP_CONTENT_SID`

### 2. Refuerzo del servicio Twilio

En `TwilioTwoFactorPhoneService.ts` se hicieron estos ajustes:

- Se separo el manejo por canal en `SMS`, `WHATSAPP` y `VOICE`.
- Se agrego validacion del remitente `TWILIO_FROM_PHONE`.
- Se normalizo el prefijo `whatsapp:` para evitar formatos inconsistentes.
- Se valido que los numeros telefonicos cumplan formato E.164.
- Se bloqueo el uso de configuraciones invalidas, por ejemplo:
  - usar un remitente `whatsapp:` para SMS
  - usar WhatsApp sin prefijo `whatsapp:` en el remitente
  - usar numeros mal formados
- Se dejo soporte opcional para `TWILIO_WHATSAPP_CONTENT_SID` cuando el mensaje necesita iniciar conversacion con una plantilla aprobada.
- Cuando se usa plantilla, el backend envia `ContentVariables={"1":"<codigo>"}`. La plantilla de Twilio debe poner el codigo en `{{1}}`, por ejemplo: `Tu codigo de verificacion ERP es {{1}}`.
- Se mejoro el manejo de errores de Twilio:
  - captura de errores de red
  - parseo de errores JSON de Twilio
  - mensajes mas claros al fallar el envio

### 3. Cobertura de pruebas

En `TwilioTwoFactorPhoneService.spec.ts` se agregaron y ajustaron pruebas para verificar:

- envio correcto del codigo por WhatsApp
- normalizacion del numero destino y del prefijo `whatsapp:`
- rechazo de numeros fuera de formato E.164
- rechazo de SMS cuando el remitente es de WhatsApp
- uso correcto de `ContentSid` y `ContentVariables` cuando aplica plantilla de WhatsApp
- lectura correcta de errores JSON devueltos por Twilio

### 4. Ajuste de TypeScript en frontend

En `packages/frontend/tsconfig.json` se hicieron ajustes de soporte:

- `ignoreDeprecations` se fijo en `5.0` para coincidir con la version real de TypeScript usada en el proyecto
- se eliminaron `baseUrl` y `paths` del frontend porque no eran necesarios y generaban advertencias en el editor

## Parte del flujo que no se modifico

La logica central de autenticacion en `AuthSessionService` no se cambio en esta etapa. El refuerzo principal se concentro en la capa de integracion con Twilio y en las pruebas.

## Validaciones realizadas

Se valido el cambio con:

- pruebas unitarias del servicio Twilio
- pruebas unitarias del flujo `AuthSessionService`
- typecheck de backend y frontend
- prueba real de envio al numero configurado en el entorno
- prueba de flujo completo de login 2FA por WhatsApp

## Resultado

El backend quedo capaz de:

- generar el codigo 2FA
- crear el `challengeId`
- guardar el desafio en base de datos
- enviar el codigo por WhatsApp mediante Twilio
- reportar errores de forma mas clara si la configuracion o el envio fallan

## Nota operativa

La configuracion actual usa el sandbox de Twilio para WhatsApp:

- `TWILIO_FROM_PHONE=whatsapp:+14155238886`

El numero destino debe estar unido al sandbox para que el envio funcione correctamente.
Si el mensaje va a iniciar una conversacion de negocio en WhatsApp, puede requerirse `TWILIO_WHATSAPP_CONTENT_SID` con una plantilla aprobada.
