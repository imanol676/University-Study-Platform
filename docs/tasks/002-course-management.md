# TASKS-002: Task Breakdown — Course Management

| Metadata | Detalle |
| :--- | :--- |
| **ID** | `TASKS-002` |
| **Título** | Desglose de Tareas de Implementación — SPEC-002 / PLAN-002 |
| **Estado** | `Completed` |
| **Fecha** | 2026-08-31 |
| **Versión** | 1.0.0 |
| **Especificación** | [`docs/specs/002-course-management.md`](../specs/002-course-management.md) |
| **Plan Técnico** | [`docs/plans/002-course-management.md`](../plans/002-course-management.md) |

---

## Reglas de Ejecución

1. Cada tarea debe completarse y verificarse antes de avanzar a la siguiente fase secuencial.
2. Todo el código TypeScript debe ser estricto, sin `any`.
3. Al finalizar cada fase, ejecutar `npm run typecheck`, `npm run lint` y `npm test`.
4. El estilo visual debe adherirse rigurosamente a la estética **Modo Oscuro con Liquid Glass estilo Apple** respetando la sobriedad y tono profesional de la `constitution.md`.

---

## Fase 1: Modelo de Datos, Prisma & Migraciones PostgreSQL

- [x] **TASK-002-1.1**: Actualizar `prisma/schema.prisma` agregando el enum `CourseColor`, el modelo `Course` y la relación en `Profile`.
  * **Archivos**: `prisma/schema.prisma`.
  * **Criterio de Aceptación**: `npx prisma validate` valida el esquema sin errores de sintaxis.

- [x] **TASK-002-1.2**: Crear y aplicar la migración versionada de Prisma para la tabla `courses` con Row Level Security (RLS).
  * **Archivos**: `prisma/migrations/1_add_courses/migration.sql`.
  * **Contenido**:
    * Creación del enum `CourseColor` y tabla `courses`.
    * Clave foránea `fk_courses_user` hacia `public.profiles(id)` con `ON DELETE CASCADE`.
    * Índices en `user_id` y `[user_id, is_archived]`.
    * Políticas RLS en PostgreSQL para SELECT, INSERT, UPDATE, DELETE basadas en `auth.uid() = user_id`.
  * **Criterio de Aceptación**: `npx prisma migrate deploy` aplica la migración exitosamente en Supabase.

- [x] **TASK-002-1.3**: Generar el cliente tipado de Prisma y definir los tipos del dominio de materias.
  * **Archivos**: `src/types/course.ts`.
  * **Criterio de Aceptación**: `npx prisma generate` genera los tipos y `src/types/course.ts` exporta `Course`, `CourseColor`, `CourseSummary`.

---

## Fase 2: Repositorio, Servicio y Lógica de Dominio

- [x] **TASK-002-2.1**: Implementar `CourseRepository` para acceso a datos con Prisma.
  * **Archivos**: `src/repositories/course.repository.ts`.
  * **Métodos**: `findById`, `findAllByUserId`, `create`, `update`, `delete`, `countActiveByUserId`.
  * **Criterio de Aceptación**: Métodos fuertemente tipados testeables que interactúan con `prisma.course`.

- [x] **TASK-002-2.2**: Implementar `CourseService` con validación estricta de propiedad de materia.
  * **Archivos**: `src/services/course/course.service.ts`.
  * **Lógica**:
    * Comprobar que `course.userId === currentUserId` antes de cualquier lectura o mutación.
    * Métodos: `getCourses`, `getCourseById`, `createCourse`, `updateCourse`, `deleteCourse`, `archiveCourse`, `getActiveCourseCount`.
  * **Criterio de Aceptación**: La lógica de negocio previene el acceso no autorizado y normaliza los datos.

- [x] **TASK-002-2.3**: Crear pruebas unitarias para `CourseService` con mocks.
  * **Archivos**: `src/services/course/__tests__/course.service.test.ts`.
  * **Criterio de Aceptación**: Pruebas unitarias completas pasando con `vitest`.

---

## Fase 3: Validación con Zod, Server Actions y Hooks de TanStack Query

- [x] **TASK-002-3.1**: Definir esquemas de validación Zod para creación y edición de materias.
  * **Archivos**: `src/features/course/schemas/course.schema.ts`.
  * **Esquemas**: `CreateCourseSchema`, `UpdateCourseSchema`.
  * **Criterio de Aceptación**: Validación de nombre (2 a 120 caracteres), código (hasta 30 caracteres), descripción (hasta 500 caracteres), período (hasta 60 caracteres) y colores válidos.

- [x] **TASK-002-3.2**: Crear pruebas unitarias para los esquemas Zod de materias.
  * **Archivos**: `src/features/course/schemas/__tests__/course.schema.test.ts`.
  * **Criterio de Aceptación**: Cobertura de validaciones de límites de caracteres, campos opcionales y defaults.

- [x] **TASK-002-3.3**: Implementar Server Actions para materias.
  * **Archivos**: `src/features/course/actions/course.actions.ts`.
  * **Acciones**: `getCoursesAction`, `getCourseByIdAction`, `createCourseAction`, `updateCourseAction`, `deleteCourseAction`, `archiveCourseAction`, `getActiveCourseCountAction`.
  * **Criterio de Aceptación**: Acciones que validan sesión con `authService.getCurrentSession()`, sanitizan datos y retornan respuestas con formato `{ success: boolean, data?: any, error?: string }`.

- [x] **TASK-002-3.4**: Implementar hooks cliente de `TanStack Query`.
  * **Archivos**: `src/features/course/hooks/use-courses.ts`.
  * **Hooks**: `useCourses`, `useCourse`, `useCreateCourse`, `useUpdateCourse`, `useDeleteCourse`, `useArchiveCourse`, `useActiveCourseCount`.
  * **Criterio de Aceptación**: Manejo reactivo de estado con invalidación automática de cache tras mutaciones.

---

## Fase 4: Componentes UI de Materias (Dark Liquid Glass)

- [x] **TASK-002-4.1**: Implementar componente `CourseCard`.
  * **Archivos**: `src/components/courses/CourseCard.tsx`.
  * **Detalle**: Tarjeta con cristal esmerilado (`glass-card`), acento de color temático, código, período, contadores placeholder y menú desplegable (*Editar*, *Archivar*, *Eliminar*).
  * **Criterio de Aceptación**: Renderizado responsivo y accesible con micro-interacciones suaves.

- [x] **TASK-002-4.2**: Implementar componente `CourseFormDialog` (Crear / Editar Materia).
  * **Archivos**: `src/components/courses/CourseFormDialog.tsx`.
  * **Detalle**: Diálogo modal en Desktop / Sheet en Mobile, selector visual de paleta de colores, validación en vivo con `react-hook-form` + Zod y feedback de carga.
  * **Criterio de Aceptación**: Formulario fluido capaz de crear o editar materias mostrando toasts de Sonner.

- [x] **TASK-002-4.3**: Implementar componente `CourseDeleteDialog`.
  * **Archivos**: `src/components/courses/CourseDeleteDialog.tsx`.
  * **Detalle**: Diálogo de confirmación destructiva para eliminar materia con advertencia clara.
  * **Criterio de Aceptación**: Prevención de eliminaciones accidentales con llamada al Server Action correspondiente.

- [x] **TASK-002-4.4**: Implementar componentes de detalle: `CourseHeader` y `CourseTabs`.
  * **Archivos**: `src/components/courses/CourseHeader.tsx`, `src/components/courses/CourseTabs.tsx`.
  * **Detalle**: Breadcrumbs, metadatos y tabs de navegación interna (*Documentos*, *Active Recall*, *Dominio*, *Ajustes*).
  * **Criterio de Aceptación**: Navegación interna estructurada y preparada para specs posteriores.

---

## Fase 5: Vistas de la Aplicación e Integración con Dashboard

- [x] **TASK-002-5.1**: Implementar página de listado de materias `/courses`.
  * **Archivos**: `src/app/(dashboard)/courses/page.tsx`.
  * **Detalle**: Barra de búsqueda en vivo, selector de tabs (*Activas* / *Archivadas*), botón `[+ Nueva Materia]`, grilla de `CourseCard` y `EmptyState` cuando no hay materias.
  * **Criterio de Aceptación**: Vista completa, interactiva y responsive para la gestión de materias.

- [x] **TASK-002-5.2**: Implementar página de detalle de materia `/courses/[id]`.
  * **Archivos**: `src/app/(dashboard)/courses/[id]/page.tsx`.
  * **Detalle**: Renderizado SSR con verificación de pertenencia del curso, cabecera de materia y pestañas de contenido con Empty States profesionales.
  * **Criterio de Aceptación**: Acceso fluido a materias propias y manejo de `notFound()` para URLs inexistentes o de otros usuarios.

- [x] **TASK-002-5.3**: Integrar métricas reales y accesos directos en `/dashboard`.
  * **Archivos**: `src/app/(dashboard)/dashboard/page.tsx`.
  * **Detalle**: Conectar la tarjeta "Materias activas" con el conteo real de materias y listar las materias recientes con accesos directos.
  * **Criterio de Aceptación**: El Dashboard refleja inmediatamente la cantidad de materias creadas.

---

## Fase 6: Pruebas Automatizadas y Verificación de Calidad

- [x] **TASK-002-6.1**: Implementar pruebas unitarias de renderizado para `CourseCard` y `CourseFormDialog`.
  * **Archivos**: `src/components/courses/__tests__/CourseCard.test.tsx`.
  * **Criterio de Aceptación**: Pruebas pasando satisfactoriamente con `@testing-library/react`.

- [x] **TASK-002-6.2**: Ejecutar `npm run typecheck` y asegurar 0 errores de TypeScript.
- [x] **TASK-002-6.3**: Ejecutar `npm run lint` y verificar 0 warnings / errores de ESLint.
- [x] **TASK-002-6.4**: Ejecutar `npm test` y verificar que la suite completa pase al 100%.
- [x] **TASK-002-6.5**: Ejecutar `npm run build` y asegurar que la compilación de producción sea exitosa.
- [x] **TASK-002-6.6**: Verificación manual completa en navegador y viewport móvil (crear, editar, archivar, filtrar, eliminar materias y verificar dashboard).
