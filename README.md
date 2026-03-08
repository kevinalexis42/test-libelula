# Insurtech Quote & Bind Platform

**Evaluación Técnica LibelulaSoft — Ruta 3: FULLSTACK (End-to-End)**

Plataforma insurtech que permite a usuarios solicitar cotizaciones de seguros y emitir pólizas. Implementa el flujo completo Quote & Bind con frontend y backend integrados.

---

## Ruta elegida: Fullstack (End-to-End)

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS + TypeScript + PostgreSQL + Prisma |
| Autenticación | JWT (passport-jwt) |
| Validación | class-validator + ValidationPipe (whitelist/transform) |
| Documentación API | OpenAPI/Swagger |
| Testing Backend | Vitest + Supertest |
| Frontend | Next.js 14 + TypeScript + TailwindCSS |
| Formularios | React Hook Form + Zod |
| Estado global | Zustand |
| HTTP Client | Axios con interceptores |
| Testing Frontend | Vitest + Testing Library |
| CI/CD | GitHub Actions |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js :3000)          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Login   │  │  Quote Form  │  │ Policy Detail │  │
│  │  /login  │  │  /quote      │  │ /policy/[id]  │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
│                    Zustand (Auth State)              │
│                    Axios Client + Interceptors       │
└─────────────────────────┬───────────────────────────┘
                          │ HTTP REST (JSON)
                          │ Authorization: Bearer JWT
                          ▼
┌─────────────────────────────────────────────────────┐
│                   BACKEND (NestJS :3001)             │
│                                                      │
│  ┌─────────────────────────────────────────────┐     │
│  │              API Gateway Layer               │     │
│  │    ValidationPipe │ HttpExceptionFilter      │     │
│  │    JwtAuthGuard  │ ThrottlerGuard            │     │
│  └──────┬──────────────┬────────────────┬──────┘     │
│         │              │                │            │
│  ┌──────▼──────┐ ┌─────▼──────┐ ┌──────▼──────┐     │
│  │ AuthModule  │ │CatalogsModule│ │QuotesModule │     │
│  │ /auth/login │ │/catalogs/.. │ │  /quotes    │     │
│  └──────────── ┘ └─────────── ┘ └──────────── ┘     │
│                                 ┌──────────────┐     │
│                                 │PoliciesModule│     │
│                                 │  /policies   │     │
│                                 └──────────────┘     │
│                                                      │
│  ┌────────────────────────────────────────────┐      │
│  │              PrismaService (ORM)            │      │
│  └─────────────────────┬──────────────────────┘      │
└────────────────────────┼────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              PostgreSQL Database                     │
│   users │ quotes │ policies                         │
└─────────────────────────────────────────────────────┘
```

### Decisiones de arquitectura

| Decisión | Opción elegida | Justificación |
|----------|----------------|---------------|
| Microservicios | Módulos NestJS en un único proceso | Scope de la prueba; los módulos `QuotesModule` y `PoliciesModule` tienen límites bien definidos (controller → service → Prisma), listos para extraerse como microservicios independientes |
| Comunicación entre servicios | Inyección de dependencias interna | Equivalente a HTTP interno para el scope de la prueba; se documenta la decisión |
| Catálogos | Configuración en código (constants) | Catálogos pequeños y estables; en producción se migraría a tabla de DB |
| Formato de errores | Problem Details (RFC 7807) | Formato estándar para APIs REST |
| Estado de autenticación | Zustand con persistencia en localStorage | Ligero, sin boilerplate de Redux |
| Estilos | TailwindCSS | Productividad y consistencia |

---

## Estructura del repositorio

```
TestTecnico/
├── README.md
├── .github/
│   └── workflows/
│       └── ci.yml                    # Pipeline CI/CD GitHub Actions
├── backend/                          # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma             # Modelo de datos
│   │   └── seed.ts                   # Datos iniciales (usuarios)
│   ├── src/
│   │   ├── main.ts                   # Bootstrap + Swagger
│   │   ├── app.module.ts
│   │   ├── prisma/                   # PrismaService global
│   │   ├── auth/                     # JWT auth + login
│   │   ├── catalogs/                 # Tipos de seguro, coberturas, ubicaciones
│   │   ├── quotes/                   # Cotizaciones + cálculo de prima
│   │   ├── policies/                 # Emisión de pólizas (protegido)
│   │   └── common/filters/           # HttpExceptionFilter (Problem Details)
│   ├── test/                         # Tests e2e
│   ├── .env.example
│   └── package.json
└── frontend/                         # Next.js App
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx            # Layout global + nav
    │   │   ├── page.tsx              # Landing page
    │   │   ├── login/page.tsx        # Login con React Hook Form + Zod
    │   │   ├── quote/page.tsx        # Formulario de cotización
    │   │   ├── quote/[id]/page.tsx   # Resultado + emisión de póliza
    │   │   └── policy/[id]/page.tsx  # Detalle de póliza (protegido)
    │   ├── components/               # Componentes reutilizables
    │   │   ├── Navbar.tsx            # Navbar reactiva al estado de autenticación
    │   │   ├── QuoteForm.tsx         # Formulario de cotización
    │   │   ├── QuoteResult.tsx       # Resultado + modal de confirmación
    │   │   ├── ErrorBanner.tsx       # Componente de error reutilizable
    │   │   └── LoadingSpinner.tsx    # Spinner de carga
    │   ├── lib/api.ts                # Cliente HTTP Axios + interceptores + caché de catálogos
    │   ├── store/auth.store.ts       # Zustand auth store (token + email)
    │   └── types/index.ts            # Tipos TypeScript compartidos
    ├── .env.example
    └── package.json
```

---

## Setup local paso a paso

### Prerrequisitos

- Node.js >= 20
- PostgreSQL >= 14 corriendo localmente (o Docker)
- npm >= 9

### 1. Base de datos con Docker (recomendado)

```bash
docker run --name insurtech-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=insurtech_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 2. Backend

```bash
cd backend

# Copiar variables de entorno
cp .env.example .env
# Editar .env si es necesario (DATABASE_URL, JWT_SECRET, etc.)

# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones (crea las tablas)
npm run prisma:migrate

# Sembrar datos iniciales (usuarios de prueba)
npm run prisma:seed

# Iniciar en modo desarrollo
npm run start:dev
```

Backend disponible en: `http://localhost:3001`
Swagger docs en: `http://localhost:3001/api/docs`

### 3. Frontend

```bash
cd frontend

# Copiar variables de entorno
cp .env.example .env.local
# Editar NEXT_PUBLIC_API_URL si el backend corre en otro puerto

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

Frontend disponible en: `http://localhost:3000`

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión PostgreSQL | `postgresql://postgres:password@localhost:5432/insurtech_db` |
| `JWT_SECRET` | Clave secreta para firmar JWT | `your-super-secret-key` |
| `JWT_EXPIRES_IN` | Duración del token | `1h` |
| `PORT` | Puerto del servidor | `3001` |
| `FRONTEND_URL` | URL del frontend para CORS | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL del backend | `http://localhost:3001` |

---

## Endpoints y autenticación

### Obtener token

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "Password123!"}'
```

Respuesta:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer"
}
```

### Usar token en endpoints protegidos

```bash
curl -H "Authorization: Bearer <accessToken>" http://localhost:3001/policies/<id>
```

### Resumen de endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Obtener JWT token |
| GET | `/catalogs/insurance-types` | No | Tipos de seguro |
| GET | `/catalogs/coverages?insuranceType=AUTO` | No | Coberturas por tipo |
| GET | `/catalogs/locations` | No | Provincias del Ecuador |
| POST | `/quotes` | No | Crear cotización → prima + breakdown |
| GET | `/quotes/:id` | No | Obtener cotización persistida |
| POST | `/policies` | **Sí** | Emitir póliza desde cotización |
| GET | `/policies/:id` | **Sí** | Obtener póliza persistida |

---

## Catálogos

### Fuente
Los catálogos están definidos como constantes en `backend/src/catalogs/catalogs.service.ts`. Esta decisión se tomó por la naturaleza estática y pequeña de los datos. En producción, se migrarían a una tabla `catalog_items` en PostgreSQL.

### Tipos de seguro
| Código | Nombre |
|--------|--------|
| AUTO | Seguro de Auto |
| SALUD | Seguro de Salud |
| HOGAR | Seguro de Hogar |

### Coberturas (aplican a todos los tipos)
| Código | Nombre |
|--------|--------|
| BASICA | Cobertura Básica |
| ESTANDAR | Cobertura Estándar |
| PREMIUM | Cobertura Premium |

### Ubicaciones
24 provincias del Ecuador con códigos `EC-<PROVINCIA>` (ej: `EC-PICHINCHA`, `EC-AZUAY`).

### Lógica de cálculo de prima

```
Prima = BASE + AGE_FACTOR + LOCATION_FACTOR + COVERAGE_FACTOR

BASE:
  AUTO: $200 | SALUD: $150 | HOGAR: $100

AGE_FACTOR:
  < 25 años: $50 | 25-40: $60 | 41-60: $80 | > 60: $100

LOCATION_FACTOR:
  EC-GUAYAS: $50 | EC-PICHINCHA: $45 | EC-MANABI: $40 | ...

COVERAGE_FACTOR:
  BASICA: $0 | ESTANDAR: $30 | PREMIUM: $50
```

---

## ORM y base de datos

**ORM elegido**: Prisma

### Inicializar base de datos

```bash
cd backend

# 1. Crear migración y aplicar schema
npm run prisma:migrate

# 2. Sembrar usuarios de prueba
npm run prisma:seed
```

### Schema (entidades)

- **User**: id, email, password (bcrypt), createdAt
- **Quote**: id, status (QUOTED/BOUND), insuranceType, coverage, age, location, estimatedPremium, breakdown (JSON), createdAt
- **Policy**: id, quoteId (UNIQUE — previene doble emisión), userId, status (ACTIVE/CANCELLED), issuedAt

---

## Scripts disponibles

### Backend

```bash
npm run start:dev      # Desarrollo con hot-reload
npm run build          # Compilar TypeScript
npm run start          # Producción
npm run lint           # ESLint
npm run test           # Tests unitarios (Vitest)
npm run test:e2e       # Tests de integración (Supertest)
npm run prisma:migrate # Migraciones de DB
npm run prisma:seed    # Datos iniciales
npm run db:reset       # Reset + seed
```

### Frontend

```bash
npm run dev            # Desarrollo (Next.js)
npm run build          # Build de producción
npm run start          # Servidor de producción
npm run lint           # ESLint
npm run test           # Tests unitarios (Vitest + Testing Library)
```

---

## Testing

### Backend — tests unitarios

```bash
cd backend
npm test
```

Cubre:

- `QuotesService`: cálculo de prima, factores de edad/ubicación/cobertura, `BadRequestException` para valores inválidos, `NotFoundException` para IDs inexistentes
- `AuthService`: login exitoso devuelve token firmado, `UnauthorizedException` cuando usuario no existe o contraseña incorrecta
- `CatalogsService`: 3 tipos de seguro, 24 provincias, coberturas por tipo, `isValidInsuranceType` / `isValidCoverage` / `isValidLocation`
- `PoliciesService`: emisión de póliza, marca cotización como `BOUND`, prevención de doble emisión (`ConflictException`), `NotFoundException` para cotización o póliza inexistentes
- `HttpExceptionFilter`: formato Problem Details (RFC 7807), mapeo de status → title, errores de validación con array `errors`

### Backend — tests de integración (e2e)

```bash
cd backend
npm run test:e2e
```

Requiere PostgreSQL corriendo. Cubre:
- `GET /catalogs/*` — catálogos disponibles
- `POST /auth/login` — token válido e inválido
- `POST /quotes` — creación, validaciones y errores
- `GET /quotes/:id` — persistencia
- `POST /policies` — auth requerida, doble emisión rechazada
- `GET /policies/:id` — auth requerida

### Frontend — tests de componentes

```bash
cd frontend
npm test
```

Cubre:
- `QuoteForm`: renderizado, validaciones, accesibilidad, submit
- `ErrorBanner`: renderizado, acciones, accesibilidad

---

## CI/CD

Pipeline en `.github/workflows/ci.yml` que se ejecuta en cada push/PR a `main` y `develop`:

**Backend job**:
1. Levanta PostgreSQL como service
2. `npm ci` — instalar dependencias
3. `npm run lint` — ESLint
4. `prisma migrate deploy` — migraciones
5. `npm test` — tests unitarios
6. `npm run test:e2e` — tests de integración
7. `npm run build` — compilación TypeScript

**Frontend job**:
1. `npm ci` — instalar dependencias
2. `npm run lint` — ESLint
3. `npm test` — tests de componentes
4. `npm run build` — build Next.js

---

## Credenciales de prueba

```
Email: user@example.com
Password: Password123!
```

---

## Flujo completo de prueba manual

1. Visitar `http://localhost:3000`
2. Iniciar sesión en `/login` con las credenciales de prueba
3. Ir a `/quote` y completar el formulario
4. Ver el resultado de la cotización con prima + breakdown
5. Confirmar y emitir la póliza (botón "Confirmar y Emitir Póliza")
6. Ver el detalle de la póliza emitida

Alternativamente con curl:

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}' \
  | jq -r '.accessToken')

# 2. Crear cotización
QUOTE_ID=$(curl -s -X POST http://localhost:3001/quotes \
  -H "Content-Type: application/json" \
  -d '{"insuranceType":"AUTO","coverage":"PREMIUM","age":35,"location":"EC-AZUAY"}' \
  | jq -r '.id')

echo "Quote ID: $QUOTE_ID"

# 3. Emitir póliza
curl -s -X POST http://localhost:3001/policies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"quoteId\":\"$QUOTE_ID\"}" | jq .
```
