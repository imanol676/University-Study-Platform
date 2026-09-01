# SPEC-002: Course Management

| Metadata | Detalle |
| :--- | :--- |
| **ID** | `SPEC-002` |
| **Título** | Gestión de Materias (Course Management), Aislamiento de Contexto y Vistas de Detalle |
| **Estado** | `Ready for Implementation` |
| **Fecha de Creación** | 2026-08-31 |
| **Versión** | 1.0.0 |
| **Autor/Contexto** | SDD — University Study Platform |
| **Documentos Relacionados** | [`docs/constitution.md`](../constitution.md), [`AGENTS.md`](../../AGENTS.md), [`docs/specs/001-project-fundation.md`](./001-project-fundation.md) |

---

## 1. Resumen Ejecutivo y Propósito

En **University Study Platform**, la **materia** es la unidad nuclear del producto (Sección 2 de la `constitution.md`). Todo el contenido académico, documentos, conceptos, sesiones de active recall, audios y estimaciones de dominio existen y se evalúan dentro del contexto aislado de una materia.

El objetivo de esta especificación es implementar el sistema completo de **Gestión de Materias (Course Management)**:
1. Diseñar y versionar el modelo de datos de `Course` en PostgreSQL (Prisma ORM) con aislamiento estricto por usuario y Row Level Security (RLS).
2. Implementar la capa de servicios de dominio (`CourseService`) y acceso a datos (`CourseRepository`) con validación de identidad y propiedad en el servidor.
3. Crear los flujos de creación, edición, listado, archivado y eliminación de materias mediante Server Actions y validación tipada con Zod.
4. Desarrollar la interfaz de usuario en `/courses` y la vista de detalle en `/courses/[id]` bajo la estética **Modo Oscuro con Liquid Glass estilo Apple**, optimizada para dispositivos móviles (PWA mobile-first) y desktop.
5. Conectar el conteo real de materias y el acceso directo en el panel principal (`/dashboard`).

---

## 2. Alcance (Scope)

### 2.1 Dentro del Alcance (In Scope)

* **Modelo de Datos y Base de Datos**:
  * Modelo `Course` en Prisma vinculado a `Profile` (`userId`).
  * Campos de metadatos académicos: nombre, código/cátedra, descripción, período/cuatrimestre, color/acento visual temático y estado de archivo (`isArchived`).
  * Migración versionada de Prisma incluyendo claves foráneas con eliminación en cascada (`ON DELETE CASCADE`) e índices para consultas rápidas por `userId`.
  * Políticas de Row Level Security (RLS) en PostgreSQL para aislamiento multi-tenant estricto.

* **Lógica de Servidor y Repositorios**:
  * `CourseRepository`: abstracción de acceso a base de datos para operaciones CRUD y conteos.
  * `CourseService`: capa de aplicación para verificar autenticación, validar que el recurso pertenezca al usuario autenticado, normalizar datos y procesar reglas de negocio.
  * Server Actions (`createCourseAction`, `updateCourseAction`, `deleteCourseAction`, `archiveCourseAction`).

* **Gestión de Estado en Cliente (TanStack Query)**:
  * Hooks de lectura y mutación (`useCourses`, `useCourse`, `useCreateCourse`, `useUpdateCourse`, `useDeleteCourse`).
  * Invalidación de queries y actualización optimista/inmediata del cache de cliente.

* **Interfaz de Usuario (Dark Liquid Glass / Mobile-First)**:
  * **Listado de Materias (`/courses`)**:
    * Filtros por estado (*Activas* / *Archivadas*) y barra de búsqueda en vivo.
    * Diálogo responsivo de creación/edición de materia (`CourseFormDialog`).
    * Grilla responsive de tarjetas `CourseCard` con acentos de cristal luminosos, menú de acciones contextuales (editar, archivar, eliminar) y estados vacíos (`EmptyState`).
  * **Detalle de la Materia (`/courses/[id]`)**:
    * Cabecera de materia con breadcrumbs sobrios, insignia de estado, código y período.
    * Pestañas de navegación interna de la materia:
      * *Documentos y Materiales* (contenedor preparado con Empty State para `SPEC-003`).
      * *Active Recall y Práctica* (contenedor preparado para `SPEC-004`).
      * *Dominio y Progreso* (métricas iniciales de la asignatura).
      * *Configuración de la Materia* (edición de metadatos, archivar o eliminar).
  * **Integración en Dashboard (`/dashboard`)**:
    * Actualizar la tarjeta métrica "Materias activas" con el valor real.
    * Sección de "Materias recientes" con acceso rápido directo.

### 2.2 Fuera del Alcance (Out of Scope)

* Carga, almacenamiento en Cloudflare R2 y procesamiento de archivos PDF/Audio/Imágenes (corresponde a `SPEC-003: Document Management & Ingestion`).
* Chunking, extracción de texto y embeddings vectoriales con pgvector (corresponde a `SPEC-004: Ingestion & Vector Pipeline`).
* Generación de preguntas de Active Recall, TTS y STT con Azure AI (specs posteriores).
* Compartir materias entre múltiples usuarios (el modelo actual es individual por estudiante).

---

## 3. Arquitectura y Estructura del Módulo

Siguiendo el principio de **monolito modular** y desacoplamiento de la `constitution.md`:

```text
src/
├── app/
│   └── (dashboard)/
│       └── courses/
│           ├── page.tsx                # Listado de materias (/courses)
│           └── [id]/
│               └── page.tsx            # Vista de detalle de materia (/courses/[id])
├── components/
│   └── courses/
│       ├── CourseCard.tsx              # Tarjeta de materia con Liquid Glass y menú
│       ├── CourseFormDialog.tsx        # Modal/Sheet para crear y editar materia
│       ├── CourseHeader.tsx            # Cabecera de detalle de materia con breadcrumbs
│       ├── CourseTabs.tsx              # Pestañas de navegación interna (Documentos, Práctica, Ajustes)
│       └── CourseDeleteDialog.tsx      # Diálogo de confirmación destructiva
├── features/
│   └── course/
│       ├── actions/
│       │   └── course.actions.ts       # Server Actions para mutaciones de materias
│       ├── hooks/
│       │   └── use-courses.ts          # Hooks cliente de TanStack Query
│       └── schemas/
│           └── course.schema.ts        # Schemas de validación Zod (Create / Update)
├── services/
│   └── course/
│       ├── course.service.ts           # CourseService (Lógica de negocio y verificación de pertenencia)
│       └── __tests__/
│           └── course.service.test.ts  # Pruebas unitarias de CourseService
├── repositories/
│   └── course.repository.ts           # CourseRepository (Acceso Prisma a PostgreSQL)
└── types/
    └── course.ts                       # Tipos e interfaces del dominio de materias
```

---

## 4. Modelo de Datos (Prisma & PostgreSQL)

### 4.1 Schema de Prisma (`prisma/schema.prisma`)

Se añade la tabla `courses` y su relación con `Profile`:

```prisma
// Paleta sobria para acento visual de la materia (Apple Liquid Glass)
enum CourseColor {
  INDIGO
  BLUE
  EMERALD
  AMBER
  ROSE
  PURPLE
  SLATE
  CYAN
}

model Course {
  id          String      @id @default(uuid()) @db.Uuid
  userId      String      @map("user_id") @db.Uuid
  name        String      @db.VarChar(120)
  code        String?     @db.VarChar(30)
  description String?     @db.Text
  term        String?     @db.VarChar(60) // Ej: "1er Cuatrimestre 2026", "Anual 2026"
  color       CourseColor @default(INDIGO)
  isArchived  Boolean     @default(false) @map("is_archived")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  // Relaciones
  user        Profile     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, isArchived])
  @@map("courses")
}
```

En el modelo `Profile`:
```prisma
model Profile {
  // ... campos existentes
  courses   Course[]

  @@map("profiles")
}
```

### 4.2 Row Level Security (RLS) en PostgreSQL

En el script SQL de migración versionada (`prisma/migrations/`):

```sql
-- 1. Habilitar Row Level Security en la tabla courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 2. Política SELECT: el usuario solo puede ver sus propias materias
CREATE POLICY "Users can view own courses" 
ON public.courses 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Política INSERT: el usuario solo puede insertar materias asociadas a su propio id
CREATE POLICY "Users can insert own courses" 
ON public.courses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Política UPDATE: el usuario solo puede modificar sus propias materias
CREATE POLICY "Users can update own courses" 
ON public.courses 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 5. Política DELETE: el usuario solo puede eliminar sus propias materias
CREATE POLICY "Users can delete own courses" 
ON public.courses 
FOR DELETE 
USING (auth.uid() = user_id);
```

---

## 5. Contratos de Código e Interfaces Técnicas

### 5.1 Tipos de Dominio (`src/types/course.ts`)

```typescript
export type CourseColor =
  | 'INDIGO'
  | 'BLUE'
  | 'EMERALD'
  | 'AMBER'
  | 'ROSE'
  | 'PURPLE'
  | 'SLATE'
  | 'CYAN';

export interface Course {
  id: string;
  userId: string;
  name: string;
  code: string | null;
  description: string | null;
  term: string | null;
  color: CourseColor;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseSummary extends Course {
  documentCount?: number;
  sessionCount?: number;
}
```

### 5.2 Esquemas de Validación Zod (`src/features/course/schemas/course.schema.ts`)

```typescript
import { z } from 'zod';

export const CourseColorEnum = z.enum([
  'INDIGO',
  'BLUE',
  'EMERALD',
  'AMBER',
  'ROSE',
  'PURPLE',
  'SLATE',
  'CYAN',
]);

export const CreateCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre de la materia debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede exceder 120 caracteres'),
  code: z
    .string()
    .trim()
    .max(30, 'El código no puede exceder 30 caracteres')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  term: z
    .string()
    .trim()
    .max(60, 'El período no puede exceder 60 caracteres')
    .optional()
    .or(z.literal('')),
  color: CourseColorEnum.default('INDIGO'),
});

export const UpdateCourseSchema = CreateCourseSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
```

### 5.3 Interface del Repositorio (`src/repositories/course.repository.ts`)

```typescript
export interface ICourseRepository {
  findById(id: string): Promise<Course | null>;
  findAllByUserId(userId: string, options?: { includeArchived?: boolean }): Promise<Course[]>;
  create(userId: string, data: CreateCourseInput): Promise<Course>;
  update(id: string, data: UpdateCourseInput): Promise<Course>;
  delete(id: string): Promise<void>;
  countActiveByUserId(userId: string): Promise<number>;
}
```

### 5.4 Interface del Servicio de Aplicación (`src/services/course/course.service.ts`)

```typescript
export interface ICourseService {
  getCourses(userId: string, options?: { includeArchived?: boolean }): Promise<Course[]>;
  getCourseById(userId: string, courseId: string): Promise<Course | null>;
  createCourse(userId: string, input: CreateCourseInput): Promise<Course>;
  updateCourse(userId: string, courseId: string, input: UpdateCourseInput): Promise<Course>;
  deleteCourse(userId: string, courseId: string): Promise<void>;
  archiveCourse(userId: string, courseId: string, isArchived: boolean): Promise<Course>;
  getActiveCourseCount(userId: string): Promise<number>;
}
```

---

## 6. Diseño de UI/UX y Flujos de Navegación

### 6.1 Guía Visual de Materias (Dark Liquid Glass)

* **Estilo de Tarjeta (`CourseCard`)**:
  * Contenedor de cristal esmerilado (`bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl`).
  * Acento de color sutil reflejado en el borde superior o en la insignia del icono (sin saturación agresiva).
  * Menú de tres puntos sobrio con acciones: *Editar*, *Archivar/Desarchivar*, *Eliminar*.
* **Paleta de Colores de Materias (Sutiles y Profesionales)**:
  * `INDIGO`: `text-indigo-400 bg-indigo-500/10 border-indigo-500/20`
  * `BLUE`: `text-blue-400 bg-blue-500/10 border-blue-500/20`
  * `EMERALD`: `text-emerald-400 bg-emerald-500/10 border-emerald-500/20`
  * `AMBER`: `text-amber-400 bg-amber-500/10 border-amber-500/20`
  * `ROSE`: `text-rose-400 bg-rose-500/10 border-rose-500/20`
  * `PURPLE`: `text-purple-400 bg-purple-500/10 border-purple-500/20`
  * `SLATE`: `text-slate-400 bg-slate-500/10 border-slate-500/20`
  * `CYAN`: `text-cyan-400 bg-cyan-500/10 border-cyan-500/20`

### 6.2 Flujos Principales de Usuario

```text
[Vista /courses]
   ├── Barra de Búsqueda y Filtro (Activas / Archivadas)
   ├── Botón [+ Nueva Materia] ──> Abre CourseFormDialog (Modal en Desktop / Sheet en Mobile)
   │                                   └── Guarda ──> Invalida Cache TanStack Query ──> Toast éxito
   └── Click en Tarjeta ───────────> Navega a /courses/[id]
                                           ├── Tab: Documentos (EmptyState para SPEC-003)
                                           ├── Tab: Active Recall (EmptyState para SPEC-004)
                                           ├── Tab: Progreso (Métricas placeholder)
                                           └── Tab: Ajustes (Editar / Archivar / Eliminar)
```

---

## 7. Seguridad y Autorización

En estricto cumplimiento de la Sección 3 de la `constitution.md`:
1. **Verificación de Identidad Server-Side**: Toda Server Action obtiene la sesión autenticada mediante `authService.getCurrentSession()` antes de invocar `CourseService`.
2. **Control de Propiedad**: `CourseService` consulta el curso existente y valida que `course.userId === session.user.id`. Si el curso no pertenece al usuario, lanza un error de autorización y no ejecuta la mutación.
3. **Capa RLS en PostgreSQL**: Aunque una llamada bypassée la lógica de aplicación, la directiva `USING (auth.uid() = user_id)` previene el acceso o modificación no autorizada a nivel motor de base de datos.
4. **Validación de Entradas**: Todo input se sanea y valida estrictamente mediante Zod en el servidor antes de tocar el repositorio.

---

## 8. Criterios de Aceptación (Acceptance Criteria)

### 8.1 Base de Datos y Modelo
* [ ] El modelo `Course` y el enum `CourseColor` están definidos en `schema.prisma`.
* [ ] La migración de base de datos se genera y aplica limpiamente con RLS activado y clave foránea en cascada hacia `Profile`.

### 8.2 Gestión de Materias (CRUD)
* [ ] **Creación**: El usuario puede crear una materia con nombre obligatorio, código opcional, período opcional, descripción opcional y selección de color.
* [ ] **Listado**: En `/courses` se visualizan todas las materias activas del usuario en una grilla responsive.
* [ ] **Búsqueda y Filtro**: La barra de búsqueda filtra en tiempo real por nombre o código. El filtro permite alternar entre materias *Activas* y *Archivadas*.
* [ ] **Edición**: El usuario puede editar los metadatos de cualquier materia de su propiedad desde el modal.
* [ ] **Archivado**: El usuario puede archivar y desarchivar materias. Las materias archivadas no aparecen en el listado activo principal ni en el conteo del dashboard.
* [ ] **Eliminación**: El usuario puede eliminar una materia tras confirmar en el diálogo de confirmación destructiva.

### 8.3 Vista de Detalle y Dashboard
* [ ] Al hacer clic en una materia se accede a `/courses/[id]` mostrando el header con su nombre, código y tabs de navegación interna.
* [ ] Si un usuario intenta acceder a una URL de materia ajena (`/courses/[id-de-otro]`), el servidor responde con 404 o redirección segura sin filtrar datos.
* [ ] En `/dashboard`, la tarjeta "Materias activas" refleja el número real de materias no archivadas del usuario autenticado.

---

## 9. Plan de Verificación y Testing

### 9.1 Pruebas Automatizadas
1. **Typecheck & Lint**:
   ```bash
   npm run typecheck
   npm run lint
   ```
2. **Pruebas Unitarias de Schemas y Servicios**:
   ```bash
   npm test
   ```
   * Validación de `CreateCourseSchema` (nombres cortos, nombres largos, colores válidos e inválidos).
   * Pruebas unitarias de `CourseService` (creación, lectura, denegación de acceso cuando el `userId` no coincide, eliminación y archivado).
3. **Pruebas de Componentes**:
   * Renderizado de `CourseCard` con sus respectivos colores y menús.
   * Renderizado de `/courses` con estado vacío y con grilla poblada.
4. **Verificación de Build**:
   ```bash
   npm run build
   ```

### 9.2 Verificación Manual
1. Iniciar sesión con un usuario y navegar a `/courses`.
2. Crear 2 materias con distintos nombres y colores -> Verificar que aparecen en la grilla y el toast de éxito.
3. Ir al `/dashboard` -> Verificar que "Materias activas" muestra `2`.
4. Entrar al detalle de una materia -> Verificar navegación por las pestañas.
5. Archivar una materia -> Verificar que pasa a la pestaña "Archivadas" y el dashboard actualiza su conteo a `1`.
6. Eliminar una materia archivada -> Verificar remoción completa de la base de datos.
7. Probar en viewport móvil (390px) para validar diseño táctil y responsive del diálogo y las tarjetas.
