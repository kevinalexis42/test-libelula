# Guía de Instalación y Levantamiento del Proyecto

## Insurtech Quote & Bind Platform

> Guía completa paso a paso para levantar el proyecto desde cero en ambiente local.

---

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu máquina:

| Herramienta | Versión mínima | Cómo verificar |
|-------------|----------------|----------------|
| Node.js | 20.x o superior | `node --version` |
| npm | 9.x o superior | `npm --version` |
| Git | Cualquier versión reciente | `git --version` |
| PostgreSQL | 14 o superior | `psql --version` |

> **Alternativa a PostgreSQL instalado localmente:** puedes usar Docker (ver sección más abajo).

---

## Paso 1 — Clonar el repositorio

Abre una terminal y ejecuta:

```bash
git clone https://github.com/kevinalexis42/test-libelula.git
cd test-libelula
```

Verás esta estructura de carpetas:

```
libelula-test/
├── backend/        ← API NestJS (puerto 3001)
├── frontend/       ← App Next.js (puerto 3000)
├── .github/        ← Pipeline CI/CD
└── README.md
```

---

## Paso 2 — Configurar la Base de Datos (PostgreSQL)

Tienes dos opciones. Elige la que prefieras:

---

### Opción A — Docker (recomendada, no requiere instalar PostgreSQL)

Si tienes Docker instalado, ejecuta este único comando:

```bash
docker run \
  --name insurtech-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=insurtech_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Verifica que el contenedor esté corriendo:

```bash
docker ps
```

Deberías ver algo como:

```
CONTAINER ID   IMAGE              STATUS         PORTS
abc123def456   postgres:16-alpine Up X seconds   0.0.0.0:5432->5432/tcp
```

---

### Opción B — PostgreSQL instalado localmente

Si ya tienes PostgreSQL instalado en tu máquina:

**En Windows (PowerShell o cmd):**
```cmd
psql -U postgres
```

**En Mac/Linux:**
```bash
psql -U postgres
```

Una vez dentro del prompt `postgres=#`, ejecuta:

```sql
CREATE DATABASE insurtech_db;
\q
```

Verifica la conexión:
```bash
psql -U postgres -d insurtech_db -c "SELECT 1;"
```

---

### Datos de conexión (los mismos para ambas opciones)

| Campo | Valor |
|-------|-------|
| Host | `localhost` |
| Puerto | `5432` |
| Usuario | `postgres` |
| Contraseña | `password` |
| Base de datos | `insurtech_db` |
| URL completa | `postgresql://postgres:password@localhost:5432/insurtech_db` |

> ⚠️ Si tu PostgreSQL tiene una contraseña diferente, deberás editarla en el archivo `.env` del backend (ver Paso 3).

---

## Paso 3 — Configurar el Backend

### 3.1 — Instalar dependencias

```bash
cd backend
npm install
```

Este proceso toma entre 1 y 3 minutos. Al finalizar verás `added X packages`.

### 3.2 — Crear el archivo de variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Abre el archivo `.env` con tu editor de texto. El contenido es:

```env
# Conexión a PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/insurtech_db?schema=public"

# Clave secreta para firmar los tokens JWT (cámbiala en producción)
JWT_SECRET="insurtech-jwt-secret-libelulasoft-2026"

# Duración del token
JWT_EXPIRES_IN="1h"

# Puerto del servidor
PORT=3001

# URL del frontend (para configurar CORS)
FRONTEND_URL="http://localhost:3000"
```

> Si tu PostgreSQL usa una contraseña diferente a `password`, cámbiala en `DATABASE_URL`.

### 3.3 — Generar el cliente Prisma

```bash
npm run prisma:generate
```

Esto genera el código TypeScript del ORM a partir del schema. Debes ver:
```
✔ Generated Prisma Client
```

### 3.4 — Ejecutar las migraciones (crear las tablas)

```bash
npm run prisma:migrate
```

Este comando crea las 3 tablas en la base de datos:
- `users` — Usuarios del sistema
- `quotes` — Cotizaciones de seguros
- `policies` — Pólizas emitidas

Salida esperada:
```
Applying migration `20260305_init`
Database migrated successfully.
```

> Si te pide un nombre para la migración, escribe `init` y presiona Enter.

### 3.5 — Sembrar datos iniciales (usuario de prueba)

```bash
npm run prisma:seed
```

Esto crea un usuario de prueba en la base de datos. Salida esperada:
```
Seeding database...
Seed completed successfully.
Default credentials:
  Email: user@example.com
  Password: Password123!
```

### 3.6 — Iniciar el servidor backend

```bash
npm run start:dev
```

El servidor inicia con hot-reload (se recarga automáticamente si cambias código).

Salida esperada:
```
[NestJS] Application running on port 3001
[NestJS] Swagger docs available at http://localhost:3001/api/docs
```

**Verifica que funcione** — abre en el navegador:
- API: http://localhost:3001/catalogs/insurance-types
- Swagger: http://localhost:3001/api/docs

Deberías ver la respuesta JSON de la API y la documentación interactiva de Swagger.

---

## Paso 4 — Configurar el Frontend

Abre **una nueva terminal** (deja el backend corriendo en la anterior).

### 4.1 — Instalar dependencias

```bash
cd frontend
npm install
```

### 4.2 — Crear el archivo de variables de entorno

```bash
cp .env.example .env.local
```

El archivo `.env.local` contiene:

```env
# URL del backend (no cambies esto a menos que el backend corra en otro puerto)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4.3 — Iniciar el servidor frontend

```bash
npm run dev
```

Salida esperada:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
- Ready in X.Xs
```

**Verifica que funcione** — abre en el navegador:
- http://localhost:3000

Deberías ver la página principal de la plataforma insurtech.

---

## Paso 5 — Verificar que todo funcione

Con ambos servidores corriendo, sigue este flujo de prueba:

### 5.1 — Probar en el navegador (flujo completo)

1. Abre http://localhost:3000
2. Haz clic en **"Solicitar Cotización"** o en algún tipo de seguro
3. Completa el formulario:
   - Tipo de seguro: `Seguro de Auto`
   - Cobertura: `Cobertura Premium`
   - Edad: `35`
   - Ubicación: `Azuay`
4. Haz clic en **"Obtener Cotización"**
5. Verás la prima estimada con el desglose del cálculo
6. Para emitir la póliza, haz clic en **"Confirmar y Emitir Póliza"**
7. Si no has iniciado sesión, el sistema te redirigirá al login
8. Inicia sesión con:
   - Email: `user@example.com`
   - Contraseña: `Password123!`
9. Confirma la emisión en el modal (marca el checkbox y haz clic en "Emitir Póliza")
10. Serás redirigido al detalle de tu póliza activa

### 5.2 — Probar con curl (línea de comandos)

```bash
# 1. Obtener token JWT
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}' | jq .

# 2. Crear una cotización
curl -s -X POST http://localhost:3001/quotes \
  -H "Content-Type: application/json" \
  -d '{"insuranceType":"AUTO","coverage":"PREMIUM","age":35,"location":"EC-AZUAY"}' | jq .

# 3. Emitir póliza (reemplaza TOKEN y QUOTE_ID con los valores reales)
curl -s -X POST http://localhost:3001/policies \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quoteId":"QUOTE_ID"}' | jq .
```

---

## Resumen de URLs importantes

| Servicio | URL |
|---------|-----|
| Frontend (app web) | http://localhost:3000 |
| Backend (API REST) | http://localhost:3001 |
| Swagger / OpenAPI docs | http://localhost:3001/api/docs |

---

## Comandos de referencia rápida

### Backend

```bash
# Iniciar en desarrollo (con hot-reload)
npm run start:dev

# Compilar para producción
npm run build

# Ejecutar en producción
npm run start

# Ejecutar tests unitarios
npm test

# Ejecutar tests de integración (requiere DB)
npm run test:e2e

# Ver/editar la BD en interfaz visual
npx prisma studio

# Resetear la BD y resembrar datos
npm run db:reset
```

### Frontend

```bash
# Iniciar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar tests de componentes
npm test
```

---

## Solución de problemas comunes

### ❌ Error: "Can't reach database server"

**Causa:** PostgreSQL no está corriendo o los datos de conexión son incorrectos.

**Solución:**
1. Verifica que PostgreSQL esté activo:
   - Docker: `docker ps | grep insurtech-db`
   - Local: `pg_isready -h localhost -p 5432`
2. Verifica que `DATABASE_URL` en `backend/.env` tenga las credenciales correctas.
3. Si usas Docker y el contenedor está detenido: `docker start insurtech-db`

---

### ❌ Error: "Port 3001 is already in use"

**Causa:** Otro proceso está usando el puerto 3001.

**Solución:**
```bash
# En Mac/Linux
kill -9 $(lsof -t -i:3001)

# En Windows (PowerShell)
netstat -ano | findstr :3001
# Anota el PID y luego:
taskkill /PID <PID> /F
```

---

### ❌ Error: "Prisma Client is not generated"

**Causa:** No se ejecutó `prisma generate` o hubo un error.

**Solución:**
```bash
cd backend
npx prisma generate
```

---

### ❌ Frontend muestra "Error al conectar con el servidor"

**Causa:** El backend no está corriendo o el frontend apunta a una URL incorrecta.

**Solución:**
1. Verifica que el backend esté corriendo en el puerto 3001
2. Verifica que `NEXT_PUBLIC_API_URL` en `frontend/.env.local` sea `http://localhost:3001`
3. Reinicia el servidor frontend después de cambiar variables de entorno

---

### ❌ Error al iniciar sesión: "Credenciales inválidas"

**Causa:** El seed no se ejecutó o la base de datos fue reseteada.

**Solución:**
```bash
cd backend
npm run prisma:seed
```

---

## Estructura de la base de datos

Estas son las tablas que Prisma crea automáticamente:

```sql
-- Tabla de usuarios
users (
  id        UUID PRIMARY KEY,
  email     VARCHAR UNIQUE NOT NULL,
  password  VARCHAR NOT NULL,        -- Hash bcrypt
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)

-- Tabla de cotizaciones
quotes (
  id               UUID PRIMARY KEY,
  status           ENUM('QUOTED', 'BOUND'),
  insuranceType    VARCHAR,           -- AUTO | SALUD | HOGAR
  coverage         VARCHAR,           -- BASICA | ESTANDAR | PREMIUM
  age              INTEGER,
  location         VARCHAR,           -- Código provincia Ecuador
  estimatedPremium DECIMAL,
  breakdown        JSONB,             -- Desglose del cálculo
  createdAt        TIMESTAMP
)

-- Tabla de pólizas
policies (
  id       UUID PRIMARY KEY,
  quoteId  UUID UNIQUE REFERENCES quotes(id),  -- UNIQUE previene doble emisión
  userId   UUID REFERENCES users(id),
  status   ENUM('ACTIVE', 'CANCELLED'),
  issuedAt TIMESTAMP
)
```
