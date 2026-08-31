# PLAN-001: Technical Implementation Plan — Project Foundation, Architecture Shell & Authentication

| Metadata | Detalle |
| :--- | :--- |
| **ID** | `PLAN-001` |
| **Título** | Plan Técnico de Implementación para Fundación del Proyecto, Carcasa Base y Autenticación |
| **Estado** | `Approved / Ready for Implementation` |
| **Fecha** | 2026-08-31 |
| **Versión** | 1.0.0 |
| **Especificación Relacionada** | [`docs/specs/001-project-fundation.md`](../specs/001-project-fundation.md) |
| **Documentos Base** | [`docs/constitution.md`](../constitution.md), [`AGENTS.md`](../../AGENTS.md) |

---

## 1. Resumen Ejecutivo y Objetivos Técnicos

Este documento traduce los requisitos funcionales y técnicos definidos en la especificación [`SPEC-001`](../specs/001-project-fundation.md) en un diseño de implementación concreto, estructurado y modular.

El plan establece:
1. El andamiaje inicial del proyecto con **Next.js (App Router)**, **TypeScript estricto**, **Tailwind CSS**, **shadcn/ui** y **TanStack Query**.
2. La arquitectura de persistencia con **Prisma ORM** y **PostgreSQL (Supabase)**, con sincronización automática mediante triggers de base de datos.
3. El sistema de autenticación seguro basado en **Supabase Auth SSR** (`@supabase/ssr`) con flujo PKCE y protección de rutas mediante **Next.js Middleware**.
4. El diseño del **App Shell PWA** mobile-first y desktop responsive, con navegación sobria y componentes de feedback estandarizados.
5. La infraestructura de calidad con **Vitest**, **Testing Library**, **ESLint** y **Prettier**.

---

## 2. Decisiones Arquitectónicas y Patrones de Diseño

### 2.1 Monolito Modular y Separación por Capas

El proyecto se estructurará respetando la frontera estricta entre presentación, lógica de aplicación y acceso a datos:

```text
[Cliente: React Server Components / Client Components]
                   │
                   ▼ (Invoca Server Actions / Route Handlers)
[Capa de Validación: Schemas Zod]
                   │
                   ▼ (Datos fuertemente tipados y saneados)
[Servicios de Aplicación: AuthService, UserService]
                   │ (Orquesta reglas de negocio y sesiones)
                   ▼
[Repositorios: UserRepository]
                   │ (Acceso a base de datos mediante PrismaClient)
                   ▼
[PostgreSQL en Supabase / Prisma Engine]
```

### 2.2 Principios de Responsabilidad
* **Client Components (`'use client'`)**: Responsables únicamente de interacción, formularios con `react-hook-form`, animación sutil y consumo de cache con `TanStack Query`. Prohibido importar clientes de base de datos o secretos.
* **Server Components / Server Actions**: Ejecución exclusiva en Node.js server-side. Validan inputs mediante Zod y delegan la lógica a la capa de servicios.
* **Services (`src/services/`)**: Clases o módulos funcionales puros que contienen la lógica de negocio sin acoplamiento al framework web.
* **Repositories (`src/repositories/`)**: Encapsulan las operaciones CRUD de Prisma ORM.

---

## 3. Desglose Técnico por Módulos

### 3.1 Módulo 1: Scaffolding, Tooling y Configuración Base

#### Dependencias a Instalar:
* **Core**: `next`, `react`, `react-dom`
* **TypeScript & Tooling**: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss`
* **Testing**: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
* **Estilos y UI**: `tailwindcss`, `postcss`, `autoprefixer`, `tailwind-merge`, `clsx`, `lucide-react`, `class-variance-authority`
* **Gestión de Estado y Formularios**: `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`
* **Autenticación y Base de Datos**: `@supabase/ssr`, `@supabase/supabase-js`, `@prisma/client`, `prisma` (dev)

#### Configuración de Tooling:
* **`tsconfig.json`**: `"strict": true`, `"noImplicitAny": true`, `"exactOptionalPropertyTypes": true`, `"baseUrl": "."`, `"paths": { "@/*": ["./src/*"] }`.
* **`vitest.config.ts`**: Configuración con alias `@/*`, entorno `jsdom` y setup de testing library.

---

### 3.2 Módulo 2: Base de Datos & Prisma ORM

#### Esquema de Prisma (`prisma/schema.prisma`):
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  STUDENT
  ADMIN
}

model Profile {
  id        String   @id @db.Uuid
  email     String   @unique
  fullName  String?  @map("full_name")
  avatarUrl String?  @map("avatar_url")
  role      Role     @default(STUDENT)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("profiles")
}
```

#### Migración Inicial SQL (`prisma/migrations/0_init/migration.sql`):
1. Creación de tabla `public.profiles` con tipos UUID.
2. Clave foránea explícita hacia `auth.users`:
   ```sql
   ALTER TABLE public.profiles 
   ADD CONSTRAINT fk_profiles_user 
   FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
   ```
3. Trigger de sincronización `handle_new_user()` con `SECURITY DEFINER` para poblar `public.profiles` al crearse un usuario en `auth.users`.
4. Políticas de Row Level Security (RLS) para lectura y actualización propias (`auth.uid() = id`).

#### Repositorio de Perfiles (`src/repositories/user.repository.ts`):
* `findById(id: string): Promise<UserProfile | null>`
* `findByEmail(email: string): Promise<UserProfile | null>`
* `update(id: string, data: Partial<UserProfile>): Promise<UserProfile>`

---

### 3.3 Módulo 3: Infraestructura de Autenticación SSR & Middleware

#### Clientes de Supabase:
* **`src/lib/supabase/client.ts`**: Inicializa `createBrowserClient` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
* **`src/lib/supabase/server.ts`**: Inicializa `createServerClient` usando `cookies()` de `next/headers` para lectura/escritura de cookies seguras.
* **`src/lib/supabase/middleware.ts`**: Helper `updateSession(request: NextRequest)` que refresca el token de Supabase en la cookie de la respuesta y evalúa reglas de redirección.

#### Middleware de Protección (`src/middleware.ts`):
* Evalúa `supabase.auth.getUser()`.
* **Rutas Privadas** (`/dashboard`, `/courses`, `/progress`, `/settings`): Si no hay usuario autenticado, redirige a `/login?next=${pathname}`.
* **Rutas de Auth** (`/login`, `/register`, `/forgot-password`, `/reset-password`): Si hay usuario autenticado, redirige a `/dashboard`.
* **Matcher**: Excluye `_next/static`, `_next/image`, `favicon.ico`, `manifest.json`, iconos y rutas de assets estáticos.

#### Route Handler de Callback (`src/app/api/auth/callback/route.ts`):
* Extrae el parámetro `code` de la URL.
* Ejecuta `supabase.auth.exchangeCodeForSession(code)`.
* Redirige al parámetro `next` (por defecto `/dashboard` o `/reset-password`).

#### Servicio de Autenticación (`src/services/auth/auth.service.ts`):
* Implementa `IAuthService` delegando a Supabase Server Client y gestionando errores de autenticación tipados (`InvalidCredentialsError`, `UserAlreadyExistsError`, `EmailNotConfirmedError`).

---

### 3.4 Módulo 4: Componentes UI, Formularios y App Shell

#### Primitivas shadcn/ui:
* Button, Input, Label, Card, Skeleton, DropdownMenu, Avatar, Sonner (Toast), Separator.

#### Formularios de Autenticación (`src/features/auth/components/`):
* `LoginForm`: Inputs email y password, visualización de errores, feedback de carga, redirección contextual.
* `RegisterForm`: Inputs nombre completo, email y password, validación en tiempo real con Zod, mensaje de confirmación de email.
* `ForgotPasswordForm`: Envío de enlace de recuperación.
* `ResetPasswordForm`: Ingreso y confirmación de nueva contraseña.

#### App Shell (`src/app/(dashboard)/layout.tsx`):
* **Desktop Sidebar (`src/components/layout/Sidebar.tsx`)**:
  * Logo de marca y tipografía sobria.
  * Enlaces activos con `lucide-react` icons (`LayoutDashboard`, `BookOpen`, `BarChart2`, `Settings`).
  * Perfil inferior con menú desplegable para cerrar sesión.
* **Mobile Layout (`src/components/layout/BottomNav.tsx` y `TopHeader.tsx`)**:
  * TopHeader: Título de página actual + Avatar.
  * BottomNav: 4 accesos directos con feedback táctil y estado activo sutil.
* **Componentes de Feedback (`src/components/feedback/`)**:
  * `ErrorBoundary`: Atrapa errores de renderizado con opción de recargar.
  * `LoadingSkeleton`: Vistas de carga adaptadas a tarjetas y tablas.
  * `EmptyState`: Mensajes de estado vacío con iconografía neutra y acción sugerida.

#### Configuración PWA:
* `public/manifest.json`: Configuración de standalone display, colores neutros profesionales (#0f172a, #ffffff), iconos estándar.
* `src/app/layout.tsx`: Configuración de viewport móvil, `apple-mobile-web-app-capable`, `themeColor`.

---

## 4. Estrategia de Testing y Verificación

### 4.1 Tests Unitarios
* **Esquemas Zod**: Validación de contraseñas de menos de 8 caracteres, emails malformados, nombres vacíos.
* **UserService & UserRepository**: Pruebas con `prismaMock` (`vitest-mock-extended`) verificando consulta de perfiles y actualización.
* **AuthService**: Pruebas de manejo de errores y mapeo de respuestas de Supabase.

### 4.2 Tests de Componentes
* Renderizado accesible de `Sidebar` y `BottomNav`.
* Renderizado y validación de formulario `LoginForm` con Testing Library.

### 4.3 Verificación de Compilación y Calidad
* `npm run lint` (ESLint sin warnings ni errores)
* `npm run typecheck` (TypeScript estricto sin errores)
* `npm test` (Suite de Vitest pasando al 100%)
* `npm run build` (Compilación exitosa de Next.js)

---

## 5. Matriz de Riesgos Técnicos y Mitigaciones

| Riesgo Técnico | Impacto | Mitigación Planificada |
| :--- | :---: | :--- |
| **Cookies desincronizadas en Middleware** | Alto | Utilizar la implementación oficial recomendada por `@supabase/ssr` en `middleware.ts` pasando la `request` y `response` clonada para fijar las cookies actualizadas. |
| **Inconsistencia de perfiles entre `auth.users` y `profiles`** | Alto | Implementar un Trigger PostgreSQL `SECURITY DEFINER` que garantiza inserción atómica e inmediata tras la creación del usuario en Supabase Auth. |
| **Bypass de RLS en consultas de servidor** | Medio | En la capa de servicios (`UserService`), verificar explícitamente el `user.id` de la sesión activa de Supabase antes de invocar operaciones en `UserRepository`. |
| **Bloqueo de compilación por variables de entorno faltantes en CI** | Bajo | Utilizar defaults seguros para build estático o validación con esquema de variables (`zod/env`). |
