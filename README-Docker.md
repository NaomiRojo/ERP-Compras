# Docker en WSL para Erp-Proyecto

## Que instalar para usar Docker en este proyecto

Si vas a trabajar el proyecto usando Docker en WSL, instala esto:

### Obligatorio

1. WSL2 en Windows.
2. Una distro Linux en WSL, por ejemplo Ubuntu.
3. Docker Desktop en Windows.
4. Integracion de Docker Desktop con WSL habilitada para tu distro.
5. Git dentro de WSL para clonar o actualizar el repositorio.

### Opcional para desarrollo fuera de Docker

Si ademas quieres trabajar el proyecto sin Docker, entonces tambien instala:

1. Bun.
2. Swagger CLI globalmente.
3. typescript-language-server globalmente.
4. Nix + direnv si vas a usar el flujo con Nix.

## Que NO hace falta instalar si usas Docker

Si tu flujo sera con Docker, no hace falta instalar localmente en Windows o en WSL:

- Node.js
- npm
- Bun para ejecutar la app dentro de contenedores
- react
- react-dom
- typeorm
- @faker-js/faker
- otras dependencias JavaScript del proyecto

Esas dependencias se instalan dentro de las imagenes con bun install durante el build.

## Instalacion recomendada paso a paso

### 1. Instalar WSL2

En PowerShell como administrador:

    wsl --install -d Ubuntu

Luego reinicia Windows si te lo pide.

Para verificar:

    wsl -l -v

Debes ver tu distro corriendo con version 2.

### 2. Instalar Docker Desktop

1. Descarga e instala Docker Desktop en Windows.
2. Abre Docker Desktop.
3. Ve a Settings > General.
4. Activa Use the WSL 2 based engine.
5. Ve a Settings > Resources > WSL Integration.
6. Activa la integracion para tu distro, por ejemplo Ubuntu.
7. Aplica cambios y reinicia Docker Desktop si es necesario.

Importante: si usas Docker Desktop con integracion WSL, normalmente no necesitas instalar Docker Engine manualmente dentro de Ubuntu.

### 3. Instalar Git dentro de WSL

En Ubuntu:

    sudo apt update
    sudo apt install -y git

### 4. Verificar Docker dentro de WSL

Abre tu terminal WSL y ejecuta:

    docker --version
    docker compose version

Si ambos comandos responden bien, ya puedes usar el proyecto con Docker desde WSL.

## Dependencias del proyecto y como se instalan

Este repositorio esta organizado como monorepo y cada servicio instala sus propias dependencias dentro del contenedor.

### Frontend

El frontend usa:

- react
- react-dom
- @types/react
- @types/react-dom
- @types/bun

Estas dependencias salen de:

- packages/frontend/package.json

Y se instalan en la imagen con:

    RUN bun install

### Backend

El backend usa:

- typeorm
- @faker-js/faker
- @types/bun
- typescript

Estas dependencias salen de:

- packages/backend/package.json

Y se instalan en la imagen con:

    RUN bun install

## Contenedor de base de datos

Ahora el proyecto tambien incluye un contenedor PostgreSQL para desarrollo futuro.

### Servicio agregado

- servicio: db
- imagen: postgres:16-alpine
- puerto: 5432
- volumen persistente: postgres_data

### Credenciales iniciales de desarrollo

- base de datos: erp
- usuario: erp_user
- password: erp_password

### URL de conexion para el backend

Dentro de Docker Compose, el backend podra conectarse con:

    postgres://erp_user:erp_password@db:5432/erp

## Estructura Docker del proyecto

Los archivos usados para Docker son:

- docker-compose.yml
- packages/frontend/Dockerfile
- packages/backend/Dockerfile
- packages/frontend/.dockerignore
- packages/backend/.dockerignore

Cada servicio se construye desde su propia carpeta:

- frontend: ./packages/frontend
- backend: ./packages/backend
- db: imagen oficial de PostgreSQL

## Problema original que se soluciono

El error principal era este durante el build del frontend:

    COPY package.json bun.lock ./
    ...
    "/bun.lock": not found

### Causa real

El Dockerfile del frontend intentaba copiar bun.lock, pero el contexto de build del servicio era ./packages/frontend.

Eso significa que Docker solo podia ver archivos dentro de packages/frontend, mientras que bun.lock estaba en la raiz del repositorio.

Por eso el build fallaba.

## Cambios que se hicieron para arreglar Docker

### 1. Se limpio docker-compose.yml

Se elimino la clave version porque Docker Compose actual la considera obsoleta.

### 2. Se corrigio el Dockerfile del frontend

Antes intentaba copiar bun.lock desde un contexto donde ese archivo no existia.

Ahora usa una secuencia alineada con el paquete frontend:

    COPY package.json ./
    RUN bun install
    COPY . .

### 3. Se corrigio el Dockerfile del backend

Se dejo la misma estructura estable:

    COPY package.json ./
    RUN bun install
    COPY . .

### 4. Se corrigieron los scripts del frontend

El frontend estaba intentando ejecutar una entrada incorrecta para navegador.

Se ajusto para usar:

    bun --hot src/index.html

Con eso el dev server queda disponible en el puerto 3000.

### 5. Se limpiaron imports rotos del frontend

App.tsx importaba archivos que no existian y eso hacia caer el contenedor.

Se removieron imports de prueba que estaban rotos.

### 6. Se agregaron scripts al backend

El backend no tenia script dev/start en package.json.

Se agregaron para que el contenedor pueda iniciar con un comando coherente.

### 7. Se agrego un contenedor de PostgreSQL

Se creo el servicio db con:

- volumen persistente
- credenciales de desarrollo
- puerto 5432 expuesto
- healthcheck para que backend espere a la base de datos

## Resultado despues del arreglo

Ahora funciona:

- docker compose build frontend
- docker compose build backend
- docker compose up --build
- docker compose up -d db

El frontend queda disponible en:

- http://localhost:3000

La base de datos queda disponible en:

- localhost:5432

## Como levantar el proyecto

Desde WSL:

    cd ~/Erp-Proyecto
    docker compose up --build

Si solo quieres levantar la base de datos:

    docker compose up -d db

Para correr todo en segundo plano:

    docker compose up -d --build

Para detenerlo:

    docker compose down

## Comandos utiles

Ver estado de contenedores:

    docker compose ps

Ver logs del frontend:

    docker compose logs -f frontend

Ver logs del backend:

    docker compose logs -f backend

Ver logs de la base de datos:

    docker compose logs -f db

Entrar a PostgreSQL dentro del contenedor:

    docker compose exec db psql -U erp_user -d erp

Reconstruir solo frontend:

    docker compose build frontend

Reconstruir solo backend:

    docker compose build backend

## Estado actual del backend

Docker ya esta configurado y los contenedores construyen bien, pero el backend todavia no tiene una API real implementada.

El archivo packages/backend/src/index.ts sigue vacio, asi que el siguiente paso real del proyecto es crear el servidor en el puerto 4000 y conectarlo a PostgreSQL.

## Problemas comunes

### docker: command not found dentro de WSL

Revisa que:

- Docker Desktop este abierto.
- La integracion WSL este activada para tu distro.
- Estes usando la misma distro habilitada en Docker Desktop.

### El puerto 3000 no abre

Ejecuta:

    docker compose ps
    docker compose logs -f frontend

Si el log muestra la URL localhost:3000, el frontend deberia abrir en el navegador.

### El puerto 5432 no abre

Ejecuta:

    docker compose ps
    docker compose logs -f db

Si el servicio db esta arriba, PostgreSQL deberia quedar disponible en localhost:5432.

### El backend no responde en 4000

Eso no es un fallo de Docker en este momento. El backend aun no implementa una API en su archivo de entrada.

## Resumen rapido

Para usar este proyecto con Docker necesitas instalar principalmente WSL2, Ubuntu, Docker Desktop con integracion WSL y Git.

Las dependencias JavaScript del proyecto no se instalan manualmente en tu maquina para el flujo Docker: se instalan dentro de los contenedores con bun install durante el build.

Ademas, ahora ya tienes un contenedor PostgreSQL listo para empezar a guardar datos cuando implementes la capa de persistencia del backend.
