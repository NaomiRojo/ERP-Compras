# Deploy Frontend con Azure Static Web Apps y Agente Local

Esta guía documenta la configuración aplicada en este repositorio para ejecutar CI/CD del frontend usando un agente autohospedado de Azure DevOps en Windows y despliegue a Azure Static Web Apps.

## Objetivo

- Ejecutar validaciones de frontend en la rama `prueba` con menor consumo de RAM.
- Desplegar `packages/frontend/dist` a Azure Static Web Apps.
- Evitar dependencia de `bash` en agente Windows.

## Arquitectura de ramas usada

- `main`: estable / producción.
- `prueba`: integración y despliegue de frontend.
- `feat/*`: ramas de trabajo por funcionalidad.

## Requisitos previos

- Repositorio Azure DevOps conectado.
- Recurso Azure Static Web Apps creado en Azure Portal.
- Deployment token de Static Web App disponible.
- Agente self-hosted Windows instalado y online.

## 1) Configurar agente self-hosted (Windows)

1. En Azure DevOps abrir `Project settings` -> `Agent pools`.
2. Crear o usar pool `pc-naomi`.
3. Descargar agente Windows y descomprimir (ejemplo: `C:\agent`).
4. Configurar agente:

```powershell
cd C:\agent
.\config.cmd
```

5. Registrar en pool `pc-naomi`.
6. Ejecutar como servicio o con `run.cmd`.
7. Verificar estado `Online` en el pool.

## 2) Configurar secretos en Library

1. Ir a `Pipelines` -> `Library`.
2. Crear variable group `erp-secret`.
3. Crear variable secreta `compras` con el **deployment token** de Static Web Apps.
4. En `Pipeline permissions`, autorizar el pipeline.

Importante:
- No usar PAT de Azure DevOps para deploy de Static Web Apps.
- `compras` debe ser el token del recurso Static Web App.

## 3) Configuración de pipeline aplicada

Archivo: `azure-pipelines.yml`

Puntos clave:

- Pool local:

```yaml
pool:
  name: PC-naomi
```

- Variable group:

```yaml
variables:
  - group: erp-secret
```

- En `prueba` se omite backend y se ejecuta frontend con tests reducidos (`test:smoke`).
- Se compila frontend y se publica artefacto `frontend-dist`.
- Se valida presencia del secreto `compras`.

## 4) Deploy de Static Web App en agente Windows

Se usa SWA CLI en PowerShell (no la tarea `AzureStaticWebApp@0`) porque en agente Windows self-hosted la tarea puede requerir `bash`.

Paso aplicado:

```yaml
- task: NodeTool@0
  inputs:
    versionSpec: '20.x'

- task: PowerShell@2
  env:
    COMPRAS_TOKEN: $(compras)
  inputs:
    targetType: inline
    script: |
      Push-Location packages/frontend
      npx -y @azure/static-web-apps-cli@latest deploy ./dist --deployment-token "$env:COMPRAS_TOKEN" --env production
      Pop-Location
```

## 5) Reducción de consumo de RAM en CI

En `packages/frontend/package.json` se agregó:

```json
"test:smoke": "bun test src/config.test.ts src/api/http.test.ts src/mocks/data.test.ts src/router/views.test.ts src/router/guards.test.tsx src/utils/session.test.ts src/utils/validation.test.ts src/hooks/useInactivityTimeout.test.tsx --parallel=1 --max-concurrency=2"
```

Uso en `prueba`:

- Ejecuta `bun run test:smoke`.
- En otras ramas mantiene `bun test` completo.

## 6) Flujo de ejecución recomendado

1. Push de cambios a `prueba`.
2. Ejecutar pipeline manual o por trigger.
3. Verificar pasos:
   - `Instalar Bun`
   - `Instalar dependencias`
   - `Frontend - typecheck + tests + build`
   - `Publicar artefacto frontend`
   - `Desplegar frontend a Azure Static Web Apps`
4. Validar URL publicada de Static Web App.

## 7) Troubleshooting rápido

### Error: sin paralelismo hospedado

- Mensaje típico: no se compró ni concedió paralelismo alojado.
- Solución: usar agente self-hosted (`pc-naomi`).

### Error: `bash` no encontrado en deploy

- Causa: tarea `AzureStaticWebApp@0` en agente Windows.
- Solución: desplegar con SWA CLI vía PowerShell.

### Error: `bun` no se reconoce

- Solución aplicada: descarga portable de Bun en el paso `Instalar Bun` y prepend de `PATH`.

### Pipeline en cola permanente

- Verificar agente `Online` e `Idle`.
- Cancelar runs viejos en ejecución.

### Error por secreto faltante

- Verificar variable group `erp-secret`.
- Verificar variable secreta `compras`.
- Verificar permisos de pipeline sobre Library.

## 8) Seguridad

- No guardar tokens en código o YAML en texto plano.
- Rotar cualquier token expuesto accidentalmente.
- Mantener deployment token solo en variables secretas de Azure DevOps.
