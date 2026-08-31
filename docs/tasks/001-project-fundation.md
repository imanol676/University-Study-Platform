# TASKS-001: Task Breakdown — Project Foundation, Architecture Shell & Authentication

| Metadata | Detalle |
| :--- | :--- |
| **ID** | `TASKS-001` |
| **Título** | Desglose de Tareas de Implementación — SPEC-001 |
| **Estado** | `Completed` |
| **Fecha** | 2026-08-31 |
| **Versión** | 1.0.0 |
| **Especificación** | [`docs/specs/001-project-fundation.md`](../specs/001-project-fundation.md) |
| **Plan Técnico** | [`docs/plans/001-project-fundation.md`](../plans/001-project-fundation.md) |

---

## Reglas de Ejecución

1. Cada tarea debe completarse antes de pasar a la siguiente fase secuencial.
2. Cada archivo creado debe respetar TypeScript estricto, sin uso de `any`.
3. Al finalizar cada bloque de tareas, verificar que `npm run typecheck`, `npm run lint` y `npm test` pasen satisfactoriamente.
4. Las credenciales sensibles deben mantenerse exclusivamente en `.env` (ignorado en git) con su respectiva plantilla en `.env.example`.

---

## Fase 1: Scaffolding, Tooling y Configuración Base

- [x] **TASK-001-1.1**: Inicializar la estructura base de Next.js 14+ (App Router) con TypeScript estricto, Tailwind CSS y PostCSS.
  * **Archivos**: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.mjs`, `.gitignore`.
  * **Criterio de Aceptación**: El proyecto inicial compila con `npm run build` y `npm run dev`.

- [x] **TASK-001-1.2**: Configurar estructura modular de carpetas según [`PLAN-001`](../plans/001-project-fundation.md).
  * **Carpetas**: `src/app`, `src/components/{ui,layout,feedback,providers}`, `src/features/{auth,user}`, `src/services/{auth,user}`, `src/repositories`, `src/lib/{supabase,prisma}`, `src/types`.
  * **Criterio de Aceptación**: Estructura de directorios creada y alias `@/*` funcionando en `tsconfig.json`.

- [x] **TASK-001-1.3**: Configurar utilidades base de shadcn/ui y TanStack Query Provider.
  * **Archivos**: `src/lib/utils.ts` (helper `cn`), `src/lib/query-client.ts`, `src/components/providers/QueryProvider.tsx`, `components.json`.
  * **Criterio de Aceptación**: `QueryProvider` envuelve la aplicación en `src/app/layout.tsx` sin errores en consola.

- [x] **TASK-001-1.4**: Configurar la suite de calidad (ESLint, Prettier y Vitest).
  * **Archivos**: `.eslintrc.json`, `.prettierrc`, `vitest.config.ts`, `src/test/setup.ts`.
  * **Scripts en `package.json`**: `typecheck`, `lint`, `test`, `build`.
  * **Criterio de Aceptación**: `npm run typecheck`, `npm run lint` y `npm test` se ejecutan limpiamente.

- [x] **TASK-001-1.5**: Crear archivo `.env.example` con la plantilla de variables de entorno requeridas.
  * **Archivos**: `.env.example`.
  * **Variables**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`.
  * **Criterio de Aceptación**: Archivo documentado con descripciones claras y `.env` excluido de git.

---

## Fase 2: Base de Datos & Prisma ORM

- [x] **TASK-001-2.1**: Configurar Prisma ORM y definir el modelo `Profile`.
  * **Archivos**: `prisma/schema.prisma`.
  * **Detalle**: Modelo `Profile` con `id` (UUID), `email`, `fullName`, `avatarUrl`, `role` (enum `STUDENT`, `ADMIN`), `createdAt`, `updatedAt`, mapeado a tabla `profiles`.
  * **Criterio de Aceptación**: `npx prisma generate` genera el cliente tipado de Prisma sin advertencias.

- [x] **TASK-001-2.2**: Crear la migración SQL inicial con Clave Foránea, Trigger de sincronización y RLS.
  * **Archivos**: `prisma/migrations/0_init/migration.sql`.
  * **Contenido**:
    * Creación de tabla `public.profiles`.
    * Clave foránea `fk_profiles_user` hacia `auth.users(id)` con `ON DELETE CASCADE`.
    * Función y trigger `handle_new_user()` con `SECURITY DEFINER` para sincronización automática desde `auth.users`.
    * Habilitación de Row Level Security (RLS) con políticas para SELECT y UPDATE basadas en `auth.uid() = id`.
  * **Criterio de Aceptación**: Script SQL válido y ejecutable en PostgreSQL.

- [x] **TASK-001-2.3**: Implementar cliente singleton de Prisma.
  * **Archivos**: `src/lib/prisma.ts`.
  * **Criterio de Aceptación**: Instancia única global de `PrismaClient` tipada que previene múltiples instancias en desarrollo con Hot Reload.

- [x] **TASK-001-2.4**: Implementar Repositorio de Perfiles de Usuario.
  * **Archivos**: `src/types/user.ts`, `src/repositories/user.repository.ts`.
  * **Métodos**: `findById`, `findByEmail`, `create`, `update`.
  * **Criterio de Aceptación**: Métodos tipados y testeables que interactúan con `prisma.profile`.

---

## Fase 3: Infraestructura de Autenticación Supabase SSR & Middleware

- [x] **TASK-001-3.1**: Implementar clientes Supabase SSR (`client.ts`, `server.ts`, `middleware.ts`).
  * **Archivos**: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`.
  * **Criterio de Aceptación**: Clientes tipados usando `@supabase/ssr` gestionando cookies seguras (`HttpOnly`, `SameSite=Lax`, `Secure`).

- [x] **TASK-001-3.2**: Implementar Middleware de protección de rutas y actualización de sesión.
  * **Archivos**: `src/middleware.ts`.
  * **Lógica**:
    * Actualizar cookies de sesión en cada request.
    * Rutas protegidas (`/dashboard`, `/courses`, `/progress`, `/settings`) redirigen a `/login?next=<path>` si no hay sesión.
    * Rutas de auth (`/login`, `/register`, `/forgot-password`, `/reset-password`) redirigen a `/dashboard` si hay sesión activa.
    * Matcher excluyendo assets estáticos (`_next/static`, `_next/image`, `favicon.ico`, `manifest.json`, iconos).
  * **Criterio de Aceptación**: Redirecciones automáticas verificadas tanto para usuarios anónimos como autenticados.

- [x] **TASK-001-3.3**: Implementar Route Handler para Callback de Autenticación PKCE.
  * **Archivos**: `src/app/api/auth/callback/route.ts`.
  * **Lógica**: Extraer parámetro `code` y ejecutar `supabase.auth.exchangeCodeForSession(code)` redirigiendo a la URL de destino (`next`).
  * **Criterio de Aceptación**: Manejo seguro del flujo PKCE para confirmación de correos y recuperación de contraseñas.

---

## Fase 4: Capa de Servicios y Validación de Autenticación

- [x] **TASK-001-4.1**: Definir contratos de tipos y esquemas de validación Zod.
  * **Archivos**: `src/types/auth.ts`, `src/features/auth/schemas/auth.schema.ts`.
  * **Esquemas**: `SignInSchema`, `SignUpSchema`, `ForgotPasswordSchema`, `ResetPasswordSchema`.
  * **Criterio de Aceptación**: Mensajes de validación en español neutro/cercano, validación de contraseñas de mínimo 8 caracteres y emails válidos.

- [x] **TASK-001-4.2**: Implementar `AuthService` y Server Actions de autenticación.
  * **Archivos**: `src/services/auth/auth.service.ts`, `src/features/auth/actions/auth.actions.ts`.
  * **Acciones**: `signUpAction`, `signInAction`, `signOutAction`, `forgotPasswordAction`, `resetPasswordAction`.
  * **Criterio de Aceptación**: Acciones de servidor fuertemente tipadas que validan inputs con Zod, delegan a `AuthService` y retornan respuestas con formato `{ success: boolean, error?: string, data?: any }`.

- [x] **TASK-001-4.3**: Implementar `UserService`.
  * **Archivos**: `src/services/user/user.service.ts`.
  * **Métodos**: `getProfile(userId: string)`, `updateProfile(userId: string, data: UpdateProfileInput)`.
  * **Criterio de Aceptación**: Validación de autorización server-side asegurando que el usuario solo opere sobre su propio perfil.

---

## Fase 5: Componentes UI de shadcn/ui & Formularios de Autenticación

- [x] **TASK-001-5.1**: Instalar y configurar primitivas base de shadcn/ui.
  * **Componentes**: `button.tsx`, `input.tsx`, `label.tsx`, `card.tsx`, `skeleton.tsx`, `dropdown-menu.tsx`, `avatar.tsx`, `sonner.tsx`, `separator.tsx`.
  * **Criterio de Aceptación**: Componentes estilizados con Tailwind y variables de tema profesional sobrio.

- [x] **TASK-001-5.2**: Crear Layout de Autenticación `(auth)/layout.tsx`.
  * **Archivos**: `src/app/(auth)/layout.tsx`.
  * **Criterio de Aceptación**: Contenedor centrado, estético y sobrio, con logotipo y tipografía cuidada.

- [x] **TASK-001-5.3**: Implementar vista y formulario de Login (`/login`).
  * **Archivos**: `src/app/(auth)/login/page.tsx`, `src/features/auth/components/LoginForm.tsx`.
  * **Criterio de Aceptación**: Formulario funcional con validación Zod, loading spinner en botón, manejo de errores amigable y enlaces a `/register` y `/forgot-password`.

- [x] **TASK-001-5.4**: Implementar vista y formulario de Registro (`/register`).
  * **Archivos**: `src/app/(auth)/register/page.tsx`, `src/features/auth/components/RegisterForm.tsx`.
  * **Criterio de Aceptación**: Formulario con nombre, email y contraseña; visualización de estado de confirmación de correo si aplica.

- [x] **TASK-001-5.5**: Implementar vistas de Recuperación de Contraseña (`/forgot-password` y `/reset-password`).
  * **Archivos**: `src/app/(auth)/forgot-password/page.tsx`, `src/app/(auth)/reset-password/page.tsx`, `src/features/auth/components/ForgotPasswordForm.tsx`, `src/features/auth/components/ResetPasswordForm.tsx`.
  * **Criterio de Aceptación**: Flujo completo de solicitud y restablecimiento de contraseña.

---

## Fase 6: App Shell Responsive & PWA

- [x] **TASK-001-6.1**: Implementar componentes de navegación del App Shell.
  * **Archivos**: `src/components/layout/Sidebar.tsx`, `src/components/layout/BottomNav.tsx`, `src/components/layout/TopHeader.tsx`, `src/components/layout/UserNav.tsx`.
  * **Criterio de Aceptación**: Navegación desktop (Sidebar) y mobile (Bottom Nav + Top Header) con estado activo sutil e iconos de Lucide.

- [x] **TASK-001-6.2**: Implementar layout autenticado `(dashboard)/layout.tsx`.
  * **Archivos**: `src/app/(dashboard)/layout.tsx`.
  * **Criterio de Aceptación**: Layout responsive que conmuta fluidamente entre Sidebar (>= 768px) y BottomNav (< 768px).

- [x] **TASK-001-6.3**: Implementar páginas placeholder del dashboard.
  * **Archivos**: `src/app/(dashboard)/dashboard/page.tsx`, `src/app/(dashboard)/courses/page.tsx`, `src/app/(dashboard)/progress/page.tsx`, `src/app/(dashboard)/settings/page.tsx`.
  * **Criterio de Aceptación**: Vistas sobrias con títulos de sección y `PageHeader`.

- [x] **TASK-001-6.4**: Implementar componentes estandarizados de Feedback.
  * **Archivos**: `src/components/feedback/ErrorBoundary.tsx`, `src/components/feedback/LoadingSkeleton.tsx`, `src/components/feedback/EmptyState.tsx`.
  * **Criterio de Aceptación**: Componentes reutilizables para estados vacíos, cargas y captura de errores sin stack traces visibles.

- [x] **TASK-001-6.5**: Configurar PWA base (Manifest y Meta tags).
  * **Archivos**: `public/manifest.json`, `src/app/layout.tsx`.
  * **Criterio de Aceptación**: Manifest PWA válido (`standalone`, colores de marca) y meta tags móviles en el Root Layout.

---

## Fase 7: Suite de Pruebas Automatizadas (Vitest)

- [x] **TASK-001-7.1**: Implementar pruebas unitarias de esquemas Zod de autenticación.
  * **Archivos**: `src/features/auth/schemas/__tests__/auth.schema.test.ts`.
  * **Criterio de Aceptación**: Cobertura de validaciones de formato de email, longitud de contraseña y sanitización.

- [x] **TASK-001-7.2**: Implementar pruebas unitarias de `UserService` y `UserRepository` con Prisma mockeado.
  * **Archivos**: `src/services/user/__tests__/user.service.test.ts`.
  * **Criterio de Aceptación**: Pruebas de consulta y actualización de perfiles verificando control de acceso.

- [x] **TASK-001-7.3**: Implementar pruebas de renderizado de componentes de layout y formularios.
  * **Archivos**: `src/components/layout/__tests__/Sidebar.test.tsx`, `src/features/auth/components/__tests__/LoginForm.test.tsx`.
  * **Criterio de Aceptación**: Pruebas de renderizado accesible y manejo de eventos.

---

## Fase 8: Verificación Final y Criterios de Aceptación

- [x] **TASK-001-8.1**: Ejecutar `npm run typecheck` y resolver cualquier discrepancia de tipos.
- [x] **TASK-001-8.2**: Ejecutar `npm run lint` y verificar ausencia total de advertencias o errores.
- [x] **TASK-001-8.3**: Ejecutar `npm test` y verificar que el 100% de las pruebas pasen.
- [x] **TASK-001-8.4**: Ejecutar `npm run build` y asegurar que la compilación de producción termine con éxito.
- [x] **TASK-001-8.5**: Realizar la verificación manual de navegación (redirecciones de middleware, viewport móvil, cierre de sesión).
