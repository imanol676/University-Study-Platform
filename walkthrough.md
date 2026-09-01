# Walkthrough — Spec 003: Course Materials & Object Storage

Se ha completado e integrado en su totalidad la **Spec 003 — Course Materials & Object Storage** en **University Study Platform**, permitiendo la carga directa de materiales de estudio (PDFs, presentaciones PPTX, grabaciones de audio, imágenes y apuntes de texto) mediante almacenamiento de objetos en **Cloudflare R2** y persistencia en **PostgreSQL con Row Level Security (RLS)**.

---

## 1. Arquitectura y Módulos Implementados

### 1.1 Persistencia & Modelo de Datos en PostgreSQL (`prisma/schema.prisma`)
* **Enums**: `MaterialType` (`PDF`, `PPTX`, `AUDIO`, `IMAGE`, `NOTE`) y `MaterialStatus` (`UPLOADED`, `PROCESSING`, `READY`, `ERROR`).
* **Modelo `Material`**: Vinculado con claves foráneas en cascada (`ON DELETE CASCADE`) a `Course` y `Profile`.
* **Migración SQL Versionada**: `prisma/migrations/2_add_materials/migration.sql` aplicada en Supabase con políticas estrictas de **Row Level Security (RLS)** basadas en `auth.uid() = user_id`.

### 1.2 Almacenamiento Desacoplado en Cloudflare R2 (`src/services/storage/`)
* **Contrato `IStorageAdapter`**: Abstracción limpia para operaciones de almacenamiento de objetos.
* **`R2StorageAdapter`**: Implementación basada en `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner`.
* **Patrón Presigned Upload URLs**:
  * El navegador solicita autorización y sube directamente el binario a Cloudflare R2 vía HTTP `PUT`, eliminando cuellos de botella y límites de carga en el servidor Next.js.
  * Generación de **Presigned Download URLs** temporales con expiración (15 min) para descargas seguras.
  * Aislamiento por ruta: `users/{userId}/courses/{courseId}/materials/{materialId}/{filename}`.

### 1.3 Capa de Negocio & Repositorios
* **`MaterialRepository`**: Abstracción de acceso a datos Prisma para operaciones CRUD de materiales y conteos.
* **`MaterialService`**: Orquestación y verificación server-side de propiedad de materia (`course.userId === session.user.id`), validación de cuotas de tamaño y estados.

### 1.4 Validación Zod & Server Actions (`src/features/material/`)
* **Límites de tamaño y tipos MIME**:
  * **PDF**: hasta 25 MB (`application/pdf`)
  * **PPTX**: hasta 25 MB (`application/vnd.ms-powerpoint`, `presentationml`)
  * **AUDIO**: hasta 50 MB (`audio/mpeg`, `wav`, `m4a`, `ogg`, `webm`)
  * **IMAGE**: hasta 10 MB (`image/png`, `jpeg`, `webp`)
  * **NOTE**: hasta 2 MB / 50.000 caracteres
* **Server Actions**: `requestUploadUrlAction`, `confirmUploadAction`, `createNoteAction`, `getMaterialsAction`, `getMaterialDownloadUrlAction`, `updateMaterialAction`, `deleteMaterialAction`.
* **Hooks TanStack Query**: `useMaterials`, `useUploadMaterial` (con seguimiento de progreso XHR de 0% a 100%), `useCreateNote`, `useDeleteMaterial`.

### 1.5 Interfaz de Usuario (Modo Oscuro con Apple Liquid Glass)
* **`MaterialUploadZone`**: Dropzone interactiva con soporte drag & drop, botón selector y barra de progreso animada.
* **`NoteEditorDialog`**: Modal para redactar y guardar apuntes de clase con conteo de caracteres en tiempo real.
* **`MaterialCard`**: Tarjetas de archivo con cristal esmerilado, iconografía y colorimetría profesional según tipo, fecha relativa, tamaño legible y acciones.
* **`MaterialList`**: Barra de filtros por tipo (*Todos*, *PDFs*, *Presentaciones*, *Audios*, *Imágenes*, *Apuntes*), buscador en vivo y visor de apuntes.
* **`MaterialDeleteDialog`**: Diálogo de confirmación destructiva para eliminar de R2 y PostgreSQL.
* **Integración en `/courses/[id]`**: La pestaña "Documentos" ahora gestiona la subida y listado en tiempo real.
* **Actualización en `/dashboard`**: Muestra el total real de documentos cargados en el panel de inicio.

---

## 2. Resultados de Verificación y Testing

| Comando | Resultado | Notas |
| :--- | :---: | :--- |
| `npm run typecheck` | **PASS** | 0 errores de tipos en TypeScript estricto. |
| `npm run lint` | **PASS** | 0 warnings / 0 errores de ESLint. |
| `npm test` | **PASS** | **72/72 tests pasando** en 10 archivos de prueba. |
| `npm run build` | **PASS** | Todas las rutas estáticas y dinámicas compiladas exitosamente. |

---

## 3. Próximos Pasos

Con la base de almacenamiento y gestión de materiales operativa:
* **SPEC-004 — Ingestion & Vector Pipeline**: Extracción de texto de PDFs/PPTs, transcripción de audios con Whisper, segmentación (chunking) y generación de embeddings con `pgvector` en Supabase.
