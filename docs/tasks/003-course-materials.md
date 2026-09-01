# TASKS-003: Task Breakdown — Course Materials & Object Storage

| Metadata | Detalle |
| :--- | :--- |
| **ID** | `TASKS-003` |
| **Título** | Desglose de Tareas de Implementación — SPEC-003 / PLAN-003 |
| **Estado** | `Completed` |
| **Fecha** | 2026-09-01 |
| **Versión** | 1.0.0 |
| **Especificación** | [`docs/specs/003-course-materials.md`](../specs/003-course-materials.md) |
| **Plan Técnico** | [`docs/plans/003-course-materials.md`](../plans/003-course-materials.md) |

---

## Reglas de Ejecución

1. Cada tarea debe completarse y verificarse antes de avanzar a la siguiente fase secuencial.
2. Todo el código TypeScript debe ser estricto, sin `any`.
3. Al finalizar cada fase, ejecutar `npm run typecheck`, `npm run lint` y `npm test`.
4. El estilo visual debe adherirse rigurosamente a la estética **Modo Oscuro con Liquid Glass estilo Apple** respetando la sobriedad y tono profesional de la `constitution.md`.

---

## Fase 1: Dependencias, Adaptador de Storage Cloudflare R2 & Base de Datos

- [x] **TASK-003-1.1**: Instalar dependencias `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner`.
  * **Comando**: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
  * **Criterio de Aceptación**: Paquetes agregados en `package.json` y lockfile actualizado.

- [x] **TASK-003-1.2**: Implementar el contrato `IStorageAdapter` y el adaptador concreto `R2StorageAdapter`.
  * **Archivos**: `src/services/storage/storage.interface.ts`, `src/services/storage/r2-storage.adapter.ts`.
  * **Métodos**: `getPresignedUploadUrl`, `getPresignedDownloadUrl`, `deleteObject`, `headObject`.
  * **Criterio de Aceptación**: Adaptador desacoplado que genera URLs prefirmadas compatibles con Cloudflare R2 y maneja fallbacks seguros si faltan variables en local.

- [x] **TASK-003-1.3**: Actualizar `prisma/schema.prisma` agregando los enums `MaterialType`, `MaterialStatus`, el modelo `Material` y relaciones.
  * **Archivos**: `prisma/schema.prisma`.
  * **Criterio de Aceptación**: `npx prisma validate` valida el esquema sin errores de sintaxis.

- [x] **TASK-003-1.4**: Crear y aplicar la migración SQL `2_add_materials` con Row Level Security (RLS).
  * **Archivos**: `prisma/migrations/2_add_materials/migration.sql`.
  * **Contenido**:
    * Creación de enums `MaterialType` y `MaterialStatus`.
    * Creación de tabla `materials` con claves foráneas en cascada e índices por `course_id` y `user_id`.
    * Habilitación de RLS con políticas SELECT, INSERT, UPDATE, DELETE basadas en `auth.uid() = user_id`.
  * **Criterio de Aceptación**: `npx prisma migrate deploy` aplica la migración exitosamente en Supabase.

- [x] **TASK-003-1.5**: Generar cliente tipado de Prisma y definir tipos del dominio de materiales.
  * **Archivos**: `src/types/material.ts`.
  * **Criterio de Aceptación**: `npx prisma generate` genera los tipos y `src/types/material.ts` exporta `Material`, `MaterialType`, `MaterialStatus`, `PresignedUploadResult`.

---

## Fase 2: Repositorio, Servicio y Lógica de Dominio

- [x] **TASK-003-2.1**: Implementar `MaterialRepository` para persistencia en Prisma.
  * **Archivos**: `src/repositories/material.repository.ts`.
  * **Métodos**: `findById`, `findAllByCourseId`, `create`, `update`, `delete`, `countByCourseId`.
  * **Criterio de Aceptación**: Métodos tipados y testeables que interactúan con `prisma.material`.

- [x] **TASK-003-2.2**: Implementar `MaterialService` con validación de propiedad y orquestación de R2.
  * **Archivos**: `src/services/material/material.service.ts`.
  * **Lógica**:
    * Validar que la materia pertenezca al `userId` autenticado (`course.userId === userId`).
    * Métodos: `requestUploadUrl`, `confirmUpload`, `createNote`, `getMaterialsByCourse`, `getDownloadUrl`, `updateMaterial`, `deleteMaterial`.
  * **Criterio de Aceptación**: Orquestación limpia entre base de datos y Cloudflare R2 con manejo seguro de errores.

- [x] **TASK-003-2.3**: Crear pruebas unitarias para `R2StorageAdapter` y `MaterialService` con mocks.
  * **Archivos**: `src/services/storage/__tests__/r2-storage.adapter.test.ts`, `src/services/material/__tests__/material.service.test.ts`.
  * **Criterio de Aceptación**: Pruebas unitarias pasando con `vitest`.

---

## Fase 3: Validación con Zod, Server Actions y Hooks de TanStack Query

- [x] **TASK-003-3.1**: Definir esquemas de validación Zod para materiales (`RequestUploadUrlSchema`, `ConfirmUploadSchema`, `CreateNoteSchema`, `UpdateMaterialSchema`).
  * **Archivos**: `src/features/material/schemas/material.schema.ts`.
  * **Detalle**: Tipos MIME permitidos (`ALLOWED_MIME_TYPES`), tamaños máximos (`MAX_FILE_SIZES`) y límites de caracteres.
  * **Criterio de Aceptación**: Validación estricta que rechaza formatos no autorizados o archivos que excedan cuotas.

- [x] **TASK-003-3.2**: Crear pruebas unitarias para esquemas Zod de materiales.
  * **Archivos**: `src/features/material/schemas/__tests__/material.schema.test.ts`.
  * **Criterio de Aceptación**: Cobertura completa de validación de extensiones, tamaños y formatos.

- [x] **TASK-003-3.3**: Implementar Server Actions para materiales.
  * **Archivos**: `src/features/material/actions/material.actions.ts`.
  * **Acciones**: `requestUploadUrlAction`, `confirmUploadAction`, `createNoteAction`, `getMaterialsAction`, `getMaterialDownloadUrlAction`, `updateMaterialAction`, `deleteMaterialAction`.
  * **Criterio de Aceptación**: Server Actions protegidas con sesión activa y revalidación de caché (`revalidatePath`).

- [x] **TASK-003-3.4**: Implementar hooks cliente de TanStack Query y subida directa con progreso.
  * **Archivos**: `src/features/material/hooks/use-materials.ts`.
  * **Hooks**: `useMaterials`, `useRequestUploadUrl`, `useConfirmUpload`, `useCreateNote`, `useDeleteMaterial`, `useMaterialDownloadUrl`, `useUploadMaterialWithProgress`.
  * **Criterio de Aceptación**: Carga directa con seguimiento de progreso (0% a 100%) e invalidación automática de caché.

---

## Fase 4: Componentes UI de Materiales (Dark Liquid Glass)

- [x] **TASK-003-4.1**: Implementar componente `MaterialTypeBadge`.
  * **Archivos**: `src/components/materials/MaterialTypeBadge.tsx`.
  * **Detalle**: Insignias distintivas con colorimetría sobria (PDF en carmesí, PPTX en naranja, Audio en índigo, Imagen en esmeralda, Nota en azul cielo).
  * **Criterio de Aceptación**: Renderizado visual claro y accesible.

- [x] **TASK-003-4.2**: Implementar componente `MaterialCard` (Tarjeta / Fila de material).
  * **Archivos**: `src/components/materials/MaterialCard.tsx`.
  * **Detalle**: Contenedor de cristal esmerilado, icono según formato, tamaño formateado (ej. "4.2 MB"), fecha de subida, badge de estado y menú contextual (*Descargar*, *Editar*, *Eliminar*).
  * **Criterio de Aceptación**: Renderizado responsive y acciones contextuales funcionales.

- [x] **TASK-003-4.3**: Implementar componente `MaterialUploadZone` (Dropzone con Drag & Drop).
  * **Archivos**: `src/components/materials/MaterialUploadZone.tsx`.
  * **Detalle**: Área de arrastre con feedback visual al arrastrar archivos, selector tradicional, indicador de formatos admitidos y barra de progreso animada.
  * **Criterio de Aceptación**: Subida fluida de archivos con toasts de Sonner.

- [x] **TASK-003-4.4**: Implementar componente `NoteEditorDialog` (Editor de Apuntes / Notas).
  * **Archivos**: `src/components/materials/NoteEditorDialog.tsx`.
  * **Detalle**: Modal para redactar apuntes de clase con conteo de caracteres y validación en vivo.
  * **Criterio de Aceptación**: Guardado directo de notas asociado a la materia.

- [x] **TASK-003-4.5**: Implementar componente `MaterialDeleteDialog`.
  * **Archivos**: `src/components/materials/MaterialDeleteDialog.tsx`.
  * **Detalle**: Diálogo de confirmación destructiva para eliminar materiales de R2 y base de datos.
  * **Criterio de Aceptación**: Borrado seguro con feedback amigable.

- [x] **TASK-003-4.6**: Implementar componente `MaterialList` con filtros y buscador.
  * **Archivos**: `src/components/materials/MaterialList.tsx`.
  * **Detalle**: Filtros por tipo (*Todos*, *PDFs*, *Presentaciones*, *Audios*, *Imágenes*, *Notas*), barra de búsqueda en tiempo real y estados vacíos (`EmptyState`).
  * **Criterio de Aceptación**: Filtrado interactivo sin recargas de página.

---

## Fase 5: Integración en Detalle de Materia e Interfaz General

- [x] **TASK-003-5.1**: Integrar la gestión de materiales en la pestaña "Documentos" de `CourseTabs.tsx`.
  * **Archivos**: `src/components/courses/CourseTabs.tsx`.
  * **Detalle**: Reemplazar el `EmptyState` placeholder por `MaterialUploadZone` y `MaterialList`.
  * **Criterio de Aceptación**: Vista de documentos 100% funcional en `/courses/[id]`.

- [x] **TASK-003-5.2**: Actualizar contadores de documentos en `CourseTabs` (pestaña Dominio) y en el Dashboard.
  * **Archivos**: `src/components/courses/CourseTabs.tsx`, `src/app/(dashboard)/dashboard/page.tsx`.
  * **Criterio de Aceptación**: El contador de documentos procesados refleja la cantidad real de materiales subidos.

---

## Fase 6: Pruebas Automatizadas y Verificación de Calidad

- [x] **TASK-003-6.1**: Implementar pruebas unitarias de renderizado para `MaterialCard` y `MaterialTypeBadge`.
  * **Archivos**: `src/components/materials/__tests__/MaterialCard.test.tsx`.
  * **Criterio de Aceptación**: Pruebas pasando con `@testing-library/react`.

- [x] **TASK-003-6.2**: Ejecutar `npm run typecheck` y asegurar 0 errores de TypeScript.
- [x] **TASK-003-6.3**: Ejecutar `npm run lint` y verificar 0 warnings / errores de ESLint.
- [x] **TASK-003-6.4**: Ejecutar `npm test` y verificar que el 100% de las pruebas pasen.
- [x] **TASK-003-6.5**: Ejecutar `npm run build` y asegurar compilación exitosa.
- [x] **TASK-003-6.6**: Verificación manual completa en navegador y móvil (subir PDF, subir audio, crear nota, filtrar, descargar y eliminar).
