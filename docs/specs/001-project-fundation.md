# SPEC-001: Project Foundation, Architecture Shell & Authentication

| Metadata | Detalle |
| :--- | :--- |
| **ID** | `SPEC-001` |
| **Título** | Fundación del Proyecto, Carcasa Base, Autenticación y Protección de Rutas |
| **Estado** | `Ready for Implementation` |
| **Fecha de Creación** | 2026-08-31 |
| **Versión** | 1.0.0 |
| **Autor/Contexto** | SDD Foundation para University Study Platform |
| **Documentos Relacionados** | [`docs/constitution.md`](../constitution.md), [`AGENTS.md`](../../AGENTS.md) |

---

## 1. Resumen Ejecutivo y Propósito

El objetivo de esta especificación es establecer los cimientos técnicos, arquitectónicos y de experiencia de usuario sobre los cuales se construirán todas las funcionalidades futuras de **University Study Platform**.

Esta fase no incluye lógica de procesamiento de documentos, RAG ni sesiones de audio/IA. Su alcance se concentra exclusivamente en:
1. Configurar el entorno base con Next.js (App Router), TypeScript estricto, Tailwind CSS, shadcn/ui y soporte PWA.
2. Definir la arquitectura modular y estructura de directorios separando estrictamente responsabilidades de cliente, servidor, servicios y repositorios.
3. Implementar el sistema de autenticación completo y seguro basado en **Supabase Auth** (`@supabase/ssr`) y sincronización con el modelo de datos en PostgreSQL mediante **Prisma ORM**.
4. Establecer la protección de rutas mediante Middleware de Next.js (diferenciando rutas públicas, rutas de autenticación y rutas privadas protegidas).
5. Crear el **App Shell** (layout base, navegación móvil/desktop responsive, header, estados de carga y errores) respetando la sobriedad, estética profesional y principios de UI definidos en la `constitution.md`.
6. Configurar la suite de calidad (Typecheck, Linting, Testing con Vitest/Testing Library).

---

## 2. Alcance (Scope)

### 2.1 Dentro del Alcance (In Scope)

* **Estructura y Scaffolding Base**:
  * Inicialización de Next.js con App Router y TypeScript (modo estricto, sin `any`).
  * Configuración de Tailwind CSS y base de componentes shadcn/ui.
  * Configuración PWA (manifest, viewport, theme meta tags).
  * Estructura de carpetas modular por capas (`app`, `components`, `features`, `services`, `repositories`, `lib`, `types`).
  * Setup de `TanStack Query` (`QueryClientProvider`) para gestión de server-state en cliente.
  * Configuración de tooling: ESLint, Prettier, TypeScript config, scripts de validación (`typecheck`, `lint`, `test`, `build`).

* **Base de Datos & ORM**:
  * Configuración de Prisma ORM conectado a PostgreSQL (Supabase).
  * Modelo inicial `User` / `Profile` con sincronización segura tras el registro en Supabase Auth.
  * Migraciones estructuradas de base de datos.
  * Configuración de Row Level Security (RLS) básica para la tabla de perfiles de usuario.

* **Autenticación y Sesión**:
  * Integración de Supabase Auth en Next.js usando `@supabase/ssr` (manejo correcto de cookies HTTP-only).
  * Flujos de autenticación:
    * Registro de usuario (Email + Contraseña).
    * Inicio de sesión (Email + Contraseña).
    * Recuperación / restablecimiento de contraseña.
    * Cierre de sesión (Sign Out).
    * Callback handler para verificación y manejo de sesiones.
  * Formularios de autenticación con validación en cliente y servidor (Zod + React Hook Form).

* **Protección de Rutas & Middleware**:
  * Middleware de Next.js para refresco de tokens de sesión y redirección.
  * Rutas públicas (`/`, `/about`, etc.).
  * Rutas de autenticación exclusivas para invitados (`/login`, `/register`, `/forgot-password`, `/reset-password`). Redirigen a `/dashboard` si ya hay sesión.
  * Rutas protegidas (`/dashboard`, `/courses`, `/settings`, etc.). Redirigen a `/login?next=<path>` si no hay sesión.

* **App Shell & Layout**:
  * Layout de autenticación limpio y sobrio.
  * Layout principal de la aplicación autenticada:
    * Sidebar lateral colapsable/estática para desktop.
    * Bottom Navigation Bar para mobile (mobile-first PWA).
    * Header / Topbar con título dinámico, estado de conexión y menú de usuario (perfil y logout).
  * Estados globales: Loading Skeletons, Error Boundary, Not Found (404), y Toast notifications (vía Sonner / shadcn).
  * Tono visual profesional (sin emojis infantiles, sin gamificación artificial, paleta sobria).

### 2.2 Fuera del Alcance (Out of Scope)

* Gestión y subida de archivos (PDFs, PPT, audios, imágenes) y Cloudflare R2 (corresponde a `SPEC-002: Document Management`).
* Extracción de texto, chunking y generación de embeddings con pgvector (corresponde a `SPEC-003: Ingestion & Vector Pipeline`).
* Servicios de IA (Azure OpenAI, TTS, STT) y Active Recall (corresponde a specs posteriores).
* CRUD completo de materias/cursos y asignaturas (sólo se implementará la vista placeholder/dashboard del layout).
* Pasarelas de pago o límites de facturación.

---

## 3. Arquitectura y Estructura del Proyecto

### 3.1 Separación de Responsabilidades y Capas

Siguiendo el principio de **monolito modular** y desacoplamiento de la `constitution.md`:

```text
src/
├── app/                        # Rutas, layouts y Route Handlers (Next.js App Router)
│   ├── (auth)/                 # Grupo de rutas públicas de autenticación
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── layout.tsx
│   ├── (dashboard)/            # Grupo de rutas protegidas bajo el App Shell
│   │   ├── dashboard/
│   │   ├── courses/            # Placeholder de navegación
│   │   ├── settings/           # Ajustes de cuenta/perfil
│   │   └── layout.tsx          # Shell principal (Sidebar + Mobile Bottom Nav)
│   ├── api/                    # Route Handlers si son necesarios (mínimos, preferir Server Actions)
│   │   └── auth/callback/route.ts
│   ├── globals.css             # Estilos globales y variables de Tailwind
│   ├── layout.tsx              # Root Layout (Fuentes, Providers, Toaster)
│   └── page.tsx                # Landing / Redirección inicial
├── components/                 # Componentes UI reutilizables
│   ├── ui/                     # Primitivas de shadcn/ui (Button, Input, Card, etc.)
│   ├── layout/                 # AppShell, Sidebar, BottomNav, Header, UserNav
│   └── feedback/               # ErrorBoundary, LoadingSkeleton, EmptyState
├── features/                   # Módulos organizados por feature de interfaz
│   ├── auth/                   # Formularios de login/registro, hooks de auth
│   └── user/                   # Componentes de perfil y preferencias
├── services/                   # Lógica de aplicación pura (Server-side)
│   ├── auth/                   # AuthService (lógica de registro, sesión, validaciones)
│   └── user/                   # UserService (gestión de perfil)
├── repositories/               # Acceso a base de datos (Prisma)
│   └── user.repository.ts
├── lib/                        # Clientes, utilidades e integraciones de infraestructura
│   ├── supabase/
│   │   ├── client.ts           # Browser client para Supabase
│   │   ├── server.ts           # Server client (cookies) para Supabase
│   │   └── middleware.ts       # Helper de sesión para Middleware
│   ├── prisma.ts               # Instancia global tipada de PrismaClient
│   ├── query-client.ts         # Configuración de TanStack Query Client
│   └── utils.ts                # cn() y helpers utilitarios generales
└── types/                      # Definiciones de TypeScript e interfaces del dominio
    ├── auth.ts
    ├── user.ts
    └── common.ts
```

### 3.2 Patrón de Flujo de Datos

```text
[Cliente / React Component]
         │ (useQuery / useMutation / Server Action)
         ▼
[TanStack Query Cache]
         │
         ▼
[Server Action / Route Handler]
         │ (Valida Input con Zod)
         ▼
[Application Service (AuthService / UserService)]
         │ (Aplica reglas de negocio e identidad)
         ▼
[Repository (UserRepository / Prisma)]  <--->  [PostgreSQL (Supabase)]
```

---

## 4. Modelo de Datos (Prisma & PostgreSQL)

### 4.1 Schema de Base de Datos

En PostgreSQL, Supabase gestiona la tabla `auth.users`. La aplicación mantendrá una tabla pública `profiles` en el esquema `public` sincronizada mediante clave foránea con `auth.users.id`.

```prisma
// prisma/schema.prisma

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

### 4.2 Row Level Security (RLS) y Políticas

Las migraciones de PostgreSQL deben asegurar que la tabla `public.profiles` tenga RLS habilitado:

```sql
-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política de lectura: los usuarios solo pueden leer su propio perfil
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Política de actualización: los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Política de inserción: vinculada a la creación de usuario
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);
```

---

## 5. Autenticación y Protección de Rutas

### 5.1 Configuración de Clientes Supabase SSR

Se implementarán los adaptadores estándar de `@supabase/ssr`:
1. **`lib/supabase/client.ts`**: Cliente para componentes del navegador (`createBrowserClient`).
2. **`lib/supabase/server.ts`**: Cliente para Server Components, Server Actions y Route Handlers (`createServerClient` gestionando cookies de `next/headers`).
3. **`lib/supabase/middleware.ts`**: Cliente especializado para el Middleware de Next.js que renueva la sesión mediante cookies en cada request.

### 5.2 Estrategia de Middleware (`middleware.ts`)

El middleware interceptará cada solicitud entrante con la siguiente lógica:

```text
Request Entrante
       │
       ▼
Actualizar sesión Supabase (cookies)
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
¿Ruta protegida? (/dashboard, /courses, etc.)   ¿Ruta de Auth? (/login, /register, etc.)
       │                                         │
  ┌────┴────┐                               ┌────┴────┐
  │         │                               │         │
[Sesión?] [Sin sesión]                 [Sesión?] [Sin sesión]
  │         │                               │         │
  ▼         ▼                               ▼         ▼
Permitir   Redirigir a                   Redirigir   Permitir
acceso     /login?next=<path>            a /dashboard acceso
```

* **Matcher de Rutas en Middleware**:
  * Excluir: `_next/static`, `_next/image`, `favicon.ico`, archivos públicos (`robots.txt`, `manifest.json`, iconos PWA).

### 5.3 Flujos de Usuario y Formularios

1. **Registro (`/register`)**:
   * Campos: Nombre completo, Email institucional o personal, Contraseña (mínimo 8 caracteres).
   * Al registrarse con éxito en Supabase Auth, se crea el registro correspondiente en `public.profiles` mediante el `UserService` / `UserRepository`.
   * Si la confirmación de email está habilitada en Supabase, mostrar estado informativo claro.

2. **Inicio de Sesión (`/login`)**:
   * Campos: Email, Contraseña.
   * Manejo explícito de errores (credenciales inválidas, cuenta no verificada, rate limit).
   * Redirección respetando el parámetro query `next` si existe (o `/dashboard` por defecto).

3. **Recuperación de Contraseña (`/forgot-password` y `/reset-password`)**:
   * Formulario para solicitar enlace de recuperación de contraseña al correo.
   * Vista de actualización de contraseña recibiendo el token/código seguro.

4. **Cierre de Sesión (Sign Out)**:
   * Acción server-side / client-side que invalida el token de Supabase, limpia las cookies y redirige al usuario a `/login`.

---

## 6. App Shell y Diseño de Interfaz (PWA Mobile-First)

### 6.1 Tono Visual y Guía de Estilo

En cumplimiento de las secciones 16, 17 y 18 de la `constitution.md`:
* **Estética**: Sobria, limpia, minimalista y profesional (paleta neutra: pizarra/zinc, acentos en azul índigo profesional, alto contraste y legibilidad).
* **Iconografía**: [Lucide Icons](https://lucide.dev) consistente.
* **Prohibido**: Emojis en elementos principales de navegación, gamificación artificial (monedas, mascotas, confeti), lenguaje infantil.
* **Microcopy**: Formal, cercano y claro ("Iniciar sesión", "Materias", "Configuración", "Revisión pendiente").

### 6.2 Componentes del App Shell

1. **Root Providers (`src/components/providers/` o `src/app/layout.tsx`)**:
   * `QueryProvider`: TanStack Query client con configuración por defecto (staleTime prudente, no refetch agresivo en window focus).
   * `Toaster`: Notificaciones sobrias tipo Sonner.

2. **Estructura del Shell (`(dashboard)/layout.tsx`)**:
   * **Desktop (>= 768px / `md`)**:
     * **Sidebar Fijo**:
       * Logotipo sobrio + Nombre de la aplicación.
       * Links de navegación principal con iconos:
         * *Dashboard* (`/dashboard`)
         * *Materias* (`/courses`)
         * *Progreso* (`/progress`)
         * *Configuración* (`/settings`)
       * Perfil de usuario inferior con menú contextual (Nombre, email, botón "Cerrar sesión").
   * **Mobile (< 768px)**:
     * **Top Header Móvil**: Título de la vista actual + Avatar/Perfil.
     * **Bottom Navigation Bar**:
       * Barra inferior fija ergonómica con 4 accesos principales (*Inicio*, *Materias*, *Progreso*, *Ajustes*).
       * Estado activo destacado con sutil indicador visual.
   * **Área de Contenido**:
     * Padding responsive, ancho máximo contenido (`max-w-7xl` o similar), scroll fluido.

3. **Estados de UI Estandarizados**:
   * **Loading Skeleton**: Componentes `Skeleton` de shadcn/ui respetando la estructura visual de la página.
   * **Error Boundary**: Componente sobrio para capturar fallos inesperados de renderizado sin mostrar stack traces ni mensajes crudos.
   * **Empty State**: Componente reutilizable con icono sobrio, título explicativo y botón de acción principal.

### 6.3 Configuración PWA

* Archivo `public/manifest.json`:
  * `name`: "University Study Platform"
  * `short_name`: "StudyPlatform"
  * `display`: "standalone"
  * `start_url`: "/dashboard"
  * `theme_color`: "#0f172a"
  * `background_color`: "#ffffff"
  * Iconos en resoluciones estándar (192x192, 512x512).
* Meta tags en `src/app/layout.tsx` para viewport móvil, `apple-mobile-web-app-capable`, y `viewport-fit=cover`.

---

## 7. Interfaces Técnicas y Contratos de Código

### 7.1 Tipos de Dominio (`src/types/`)

```typescript
// src/types/user.ts
export type UserRole = 'STUDENT' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// src/types/auth.ts
export interface AuthSession {
  user: {
    id: string;
    email: string;
  };
  profile: UserProfile | null;
}
```

### 7.2 Interfaces de Repositorios y Servicios (`src/services/` y `src/repositories/`)

```typescript
// src/repositories/user.repository.ts
export interface IUserRepository {
  findById(id: string): Promise<UserProfile | null>;
  findByEmail(email: string): Promise<UserProfile | null>;
  create(data: { id: string; email: string; fullName?: string }): Promise<UserProfile>;
  update(id: string, data: Partial<UserProfile>): Promise<UserProfile>;
}

// src/services/auth/auth.service.ts
export interface IAuthService {
  signUp(input: SignUpInput): Promise<{ user: UserProfile; requiresEmailConfirmation: boolean }>;
  signInWithPassword(input: SignInInput): Promise<{ user: UserProfile }>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<UserProfile | null>;
}
```

### 7.3 Esquemas de Validación Zod (`src/features/auth/schemas/`)

```typescript
import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().email('Ingresá un correo electrónico válido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});

export const SignUpSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresá un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
```

---

## 8. Seguridad y Manejo de Secretos

* **Variables de Entorno**:
  * `NEXT_PUBLIC_SUPABASE_URL`: URL pública de la instancia de Supabase.
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key pública con acceso protegido por RLS.
  * `SUPABASE_SERVICE_ROLE_KEY`: Clave privilegiada (NUNCA exponer en cliente, sólo servidor).
  * `DATABASE_URL`: Connection string para Prisma (pooler / transaccional).
  * `DIRECT_URL`: Connection string directa para migraciones de Prisma.
* **Protección de Datos y Credenciales**:
  * Ninguna clave de servicio o conexión de base de datos se importa en componentes marcados con `'use client'`.
  * Cookies de sesión marcadas como `HttpOnly`, `SameSite=Lax`, y `Secure` en producción.
  * Inputs validados estrictamente con Zod antes de alcanzar la capa de servicios o base de datos.

---

## 9. Criterios de Aceptación (Acceptance Criteria)

### 9.1 Fundación del Proyecto y Tooling
* [ ] El proyecto compila limpiamente ejecutando `npm run build`.
* [ ] `npm run typecheck` pasa sin errores de TypeScript (estricto activado).
* [ ] `npm run lint` pasa sin advertencias ni errores.
* [ ] La suite de tests inicial (`npm test`) está configurada y lista para ejecutar pruebas unitarias de servicios y componentes.
* [ ] Prisma se conecta correctamente a PostgreSQL y las migraciones se ejecutan mediante `npx prisma migrate dev`.

### 9.2 Autenticación y Sesiones
* [ ] **Registro**: Un usuario puede registrarse con nombre, correo y contraseña válidos. Se crea la cuenta en Supabase Auth y el perfil en `public.profiles`.
* [ ] **Validación**: El formulario de registro rechaza correos inválidos o contraseñas menores a 8 caracteres con mensajes claros en español.
* [ ] **Login**: Un usuario registrado puede iniciar sesión y es redirigido a `/dashboard`.
* [ ] **Credenciales Erróneas**: Si se ingresan credenciales incorrectas, se muestra un mensaje de error legible sin exponer detalles técnicos.
* [ ] **Logout**: El usuario puede cerrar sesión desde el menú de usuario y es redirigido a `/login`.

### 9.3 Protección de Rutas
* [ ] **Acceso no autenticado a ruta privada**: Si un usuario no autenticado intenta acceder a `/dashboard` o `/settings`, el Middleware lo redirige a `/login?next=/dashboard`.
* [ ] **Acceso autenticado a ruta de auth**: Si un usuario con sesión activa ingresa a `/login` o `/register`, el Middleware lo redirige automáticamente a `/dashboard`.
* [ ] **Preservación de sesión**: Al refrescar la página en una ruta protegida, la sesión se mantiene intacta mediante cookies SSR.

### 9.4 App Shell y Experiencia Visual
* [ ] **Mobile Layout**: En resoluciones menores a 768px se visualiza el header superior y la barra de navegación inferior (Bottom Navigation).
* [ ] **Desktop Layout**: En resoluciones mayores a 768px se visualiza la barra lateral (Sidebar) con accesos de navegación claros y perfil de usuario.
* [ ] **Tono y Estilo**: El diseño sigue la guía de estilo sobria y profesional de la constitution (sin gamificación, sin emojis como iconos principales, tipografía nítida).
* [ ] **PWA**: El navegador detecta el archivo `manifest.json` y la aplicación puede instalarse en dispositivos móviles.

---

## 10. Plan de Verificación y Testing

### 10.1 Verificaciones Automatizadas
1. **Lint & Typecheck**:
   ```bash
   npm run lint
   npm run typecheck
   ```
2. **Pruebas Unitarias y de Integración**:
   ```bash
   npm test
   ```
   * Test de validación de schemas Zod (`SignInSchema`, `SignUpSchema`).
   * Test unitario de `UserService` y sincronización de perfiles con Prisma mockeado.
   * Test de renderizado del App Shell (Sidebar, Bottom Nav y responsive toggles).

3. **Verificación de Build**:
   ```bash
   npm run build
   ```

### 10.2 Verificación Manual (Checklist de Navegación)
1. Navegar a `/` -> Redirección a `/login` si no hay sesión.
2. Completar registro en `/register` con nuevo usuario -> Verificar creación de registro en Supabase y tabla `profiles`.
3. Cerrar sesión -> Verificar redirección a `/login`.
4. Intentar entrar a `/dashboard` directamente -> Verificar intercepción y redirección a `/login?next=%2Fdashboard`.
5. Iniciar sesión -> Verificar redirección a `/dashboard` y visualización del Shell completo.
6. Probar en viewport móvil (390px x 844px) -> Verificar ergonomía del Bottom Nav y ausencia de desbordamientos horizontales.
