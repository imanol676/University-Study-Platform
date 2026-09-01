# PLAN-002: Technical Implementation Plan — Course Management

| Metadata | Detalle |
| :--- | :--- |
| **ID** | `PLAN-002` |
| **Título** | Plan Técnico de Implementación — Gestión de Materias (Course Management) |
| **Estado** | `Approved / Ready for Implementation` |
| **Fecha** | 2026-08-31 |
| **Versión** | 1.0.0 |
| **Especificación Relacionada** | [`docs/specs/002-course-management.md`](../specs/002-course-management.md) |
| **Documentos Base** | [`docs/constitution.md`](../constitution.md), [`AGENTS.md`](../../AGENTS.md), [`docs/specs/001-project-fundation.md`](../specs/001-project-fundation.md) |

---

## 1. Resumen Ejecutivo y Objetivos Técnicos

Este documento traduce la especificación [`SPEC-002: Course Management`](../specs/002-course-management.md) en un plan técnico de ejecución estructurado y modular, estableciendo la **materia** como el contexto base aislado para todo el contenido académico, documentos y sesiones de active recall.

El plan técnico establece:
1. **Persistencia y Modelo de Datos**: Extensión de `schema.prisma` con el modelo `Course` y enum `CourseColor`, generando una migración versionada en PostgreSQL con claves foráneas en cascada y políticas de **Row Level Security (RLS)**.
2. **Capa de Dominio y Servicios**: Implementación de `CourseRepository` y `CourseService`, garantizando la verificación server-side de propiedad del recurso (`course.userId === session.user.id`).
3. **Validación y Server Actions**: Creación de schemas Zod (`CreateCourseSchema`, `UpdateCourseSchema`) y Server Actions para mutaciones seguras y tipadas.
4. **Server State en Cliente**: Integración de hooks de `TanStack Query` (`useCourses`, `useCourse`, `useCreateCourse`, etc.) con invalidación inmediata del cache.
5. **Interfaz de Usuario (Dark Liquid Glass / Mobile-First)**:
   * Vista `/courses` (Listado interactivo, búsqueda, filtros activas/archivadas, `EmptyState` y diálogo responsivo `CourseFormDialog`).
   * Vista `/courses/[id]` (Detalle con cabecera, breadcrumbs y pestañas internas preparadas para futuras specs).
   * Vista `/dashboard` (Actualización de la métrica real de materias activas y accesos rápidos).
6. **Suite de Pruebas y Calidad**: Tests unitarios de schemas, pruebas de servicio con `prismaMock` y verificación de compilación (`typecheck`, `lint`, `test`, `build`).

---

## 2. Decisiones Arquitectónicas y Flujo de Datos

### 2.1 Flujo de Ejecución y Aislamiento por Materia

```text
[Cliente: Vista /courses o /courses/[id]]
                 │
                 ▼ (useQuery / useMutation con TanStack Query)
[Server Action: createCourseAction / updateCourseAction / etc.]
                 │
                 ▼ (Valida input con Zod + Obtiene sesión con AuthService)
[CourseService: Valida pertenencia de course.userId === session.user.id]
                 │
                 ▼ (Invoca métodos tipados de persistencia)
[CourseRepository: Ejecuta operaciones de PrismaClient]
                 │
                 ▼
[PostgreSQL (Supabase) + RLS Policy USING (auth.uid() = user_id)]
```

### 2.2 Principios de Responsabilidad y Seguridad
* **Verificación de Propiedad Obligatoria**: Antes de retornar, modificar, archivar o eliminar una materia, el `CourseService` compara el `userId` autenticado contra el `user_id` de la base de datos.
* **Aislamiento en Base de Datos (RLS)**: Las políticas de PostgreSQL actúan como salvaguarda complementaria impidiendo cualquier filtración cruzada de datos entre estudiantes.
* **Cache Reactivo**: Las mutaciones en `TanStack Query` invalidan la clave `['courses']` y `['courses', id]`, provocando re-renderizado instantáneo sin recargas de página.

---

## 3. Desglose Técnico por Módulos

### 3.1 Módulo 1: Base de Datos & Prisma ORM

#### Extensión de `prisma/schema.prisma`:
```prisma
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
  term        String?     @db.VarChar(60)
  color       CourseColor @default(INDIGO)
  isArchived  Boolean     @default(false) @map("is_archived")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  user        Profile     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, isArchived])
  @@map("courses")
}
```

#### Migración SQL Versionada (`prisma/migrations/1_add_courses/migration.sql`):
1. Creación de enum `"CourseColor"`.
2. Creación de tabla `"public"."courses"`.
3. Clave foránea `"fk_courses_user"` hacia `public.profiles(id)` con `ON DELETE CASCADE`.
4. Habilitación de RLS: `ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;`.
5. Creación de políticas RLS para SELECT, INSERT, UPDATE, DELETE basadas en `auth.uid() = user_id`.

#### Tipos del Dominio (`src/types/course.ts`):
* Definición de `CourseColor`, `Course`, `CourseSummary`, `CourseFilter`.

---

### 3.2 Módulo 2: Capa de Persistencia y Servicio de Aplicación

#### Repositorio (`src/repositories/course.repository.ts`):
* `findById(id: string): Promise<Course | null>`
* `findAllByUserId(userId: string, options?: { includeArchived?: boolean }): Promise<Course[]>`
* `create(userId: string, data: CreateCourseInput): Promise<Course>`
* `update(id: string, data: UpdateCourseInput): Promise<Course>`
* `delete(id: string): Promise<void>`
* `countActiveByUserId(userId: string): Promise<number>`

#### Servicio (`src/services/course/course.service.ts`):
* `getCourses(userId: string, options?: { includeArchived?: boolean }): Promise<Course[]>`
* `getCourseById(userId: string, courseId: string): Promise<Course | null>`
* `createCourse(userId: string, input: CreateCourseInput): Promise<Course>`
* `updateCourse(userId: string, courseId: string, input: UpdateCourseInput): Promise<Course>`
* `deleteCourse(userId: string, courseId: string): Promise<void>`
* `archiveCourse(userId: string, courseId: string, isArchived: boolean): Promise<Course>`
* `getActiveCourseCount(userId: string): Promise<number>`

---

### 3.3 Módulo 3: Schemas Zod, Server Actions y Hooks de TanStack Query

#### Schemas Zod (`src/features/course/schemas/course.schema.ts`):
* `CreateCourseSchema`: nombre (min 2, max 120), código (max 30), descripción (max 500), período (max 60), color (enum).
* `UpdateCourseSchema`: campos parciales con soporte para `isArchived`.

#### Server Actions (`src/features/course/actions/course.actions.ts`):
* `getCoursesAction(includeArchived?: boolean)`
* `getCourseByIdAction(courseId: string)`
* `createCourseAction(input: CreateCourseInput)`
* `updateCourseAction(courseId: string, input: UpdateCourseInput)`
* `deleteCourseAction(courseId: string)`
* `archiveCourseAction(courseId: string, isArchived: boolean)`
* `getActiveCourseCountAction()`

#### Client Hooks (`src/features/course/hooks/use-courses.ts`):
* `useCourses(options?: { includeArchived?: boolean })`
* `useCourse(courseId: string)`
* `useCreateCourse()`
* `useUpdateCourse()`
* `useDeleteCourse()`
* `useArchiveCourse()`

---

### 3.4 Módulo 4: Componentes UI y Vistas de Materias (Liquid Glass)

#### Primitivas y Componentes Específicos:
1. **`CourseCard` (`src/components/courses/CourseCard.tsx`)**:
   * Contenedor de cristal esmerilado con esquinas redondeadas (`rounded-2xl`).
   * Acento temático de color acorde a `CourseColor` (índigo, esmeralda, ámbar, rosa, etc.).
   * Insignia de código y período.
   * Menú contextual (*Editar*, *Archivar / Desarchivar*, *Eliminar*).
2. **`CourseFormDialog` (`src/components/courses/CourseFormDialog.tsx`)**:
   * Diálogo modal responsivo (Dialog en Desktop / Drawer en Mobile).
   * Selector visual de paleta de colores para materias.
   * Campos validados en tiempo real con `react-hook-form` y Zod.
3. **`CourseDeleteDialog` (`src/components/courses/CourseDeleteDialog.tsx`)**:
   * Diálogo de confirmación destructiva con advertencia clara.
4. **`CourseHeader` (`src/components/courses/CourseHeader.tsx`)**:
   * Breadcrumbs de navegación (`Materias > [Nombre]`), estado y botones de acción rápida.
5. **`CourseTabs` (`src/components/courses/CourseTabs.tsx`)**:
   * Pestañas estilizadas con Liquid Glass: *Documentos*, *Active Recall*, *Dominio*, *Ajustes*.

#### Páginas:
1. **`/courses` (`src/app/(dashboard)/courses/page.tsx`)**:
   * Listado de materias con buscador en tiempo real.
   * Filtro por tabs: *Activas* / *Archivadas*.
   * Botón `[+ Nueva Materia]` y `EmptyState` cuando no hay registros.
2. **`/courses/[id]` (`src/app/(dashboard)/courses/[id]/page.tsx`)**:
   * Vista de detalle de la materia con pestañas internas.
   * Manejo de 404/redirección si la materia no existe o no pertenece al usuario.
3. **`/dashboard` (`src/app/(dashboard)/dashboard/page.tsx`)**:
   * Conexión de la métrica real "Materias activas".
   * Sección de accesos directos a materias recientes.

---

## 4. Estrategia de Testing y Verificación

### 4.1 Tests Unitarios
* `src/features/course/schemas/__tests__/course.schema.test.ts`: Cobertura completa de validación de campos, longitudes y colores.
* `src/services/course/__tests__/course.service.test.ts`: Pruebas de `CourseService` con `prismaMock` (creación, edición, control de acceso por `userId`, eliminación y archivado).

### 4.2 Tests de Componentes
* `src/components/courses/__tests__/CourseCard.test.tsx`: Renderizado correcto de metadatos, insignias de color y eventos de menú.

### 4.3 Checklist Automatizado
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

---

## 5. Matriz de Riesgos Técnicos y Mitigaciones

| Riesgo Técnico | Impacto | Mitigación Planificada |
| :--- | :---: | :--- |
| **Acceso a materia de otro usuario vía URL directa** | Crítico | `CourseService.getCourseById` verifica explícitamente que `course.userId === session.user.id`. Si no coincide, retorna `null` y la página ejecuta `notFound()` sin revelar existencia. |
| **Eliminación accidental de materias con contenido futuro** | Alto | Implementar `CourseDeleteDialog` con confirmación explícita y ofrecer la opción de **Archivar** como alternativa no destructiva recomendada. |
| **Desincronización visual del contador en Dashboard** | Medio | Invalidar la query clave `['active-course-count']` y `['courses']` inmediatamente en cada mutación de materia. |
| **Inconsistencias en migraciones de base de datos** | Alto | Generar la migración SQL con Prisma, incluir explícitamente los bloques de RLS y aplicar con `npx prisma migrate deploy`. |
