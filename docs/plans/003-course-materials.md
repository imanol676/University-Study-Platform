# PLAN-003: Technical Implementation Plan — Course Materials & Object Storage

| Metadata | Detalle |
| :--- | :--- |
| **ID** | `PLAN-003` |
| **Título** | Plan Técnico de Implementación — Gestión de Materiales de Estudio y Almacenamiento en Cloudflare R2 |
| **Estado** | `Approved / Ready for Implementation` |
| **Fecha** | 2026-09-01 |
| **Versión** | 1.0.0 |
| **Especificación Relacionada** | [`docs/specs/003-course-materials.md`](../specs/003-course-materials.md) |
| **Documentos Base** | [`docs/constitution.md`](../constitution.md), [`AGENTS.md`](../../AGENTS.md), [`docs/specs/001-project-fundation.md`](../specs/001-project-fundation.md), [`docs/specs/002-course-management.md`](../specs/002-course-management.md) |

---

## 1. Resumen Ejecutivo y Objetivos Técnicos

Este documento traduce la especificación [`SPEC-003: Course Materials & Object Storage`](../specs/003-course-materials.md) en un plan técnico de ejecución secuencial, robusto y modular.

El plan técnico establece:
1. **Persistencia & Modelo de Datos**: Extensión de `schema.prisma` con el modelo `Material` y enums `MaterialType` y `MaterialStatus`, generando una migración versionada en PostgreSQL con claves foráneas en cascada y políticas de **Row Level Security (RLS)**.
2. **Infraestructura de Almacenamiento**: Integración desacoplada de **Cloudflare R2** mediante `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner`, implementando el patrón de **Presigned Upload URLs** para cargas directas sin sobrecargar el servidor Next.js.
3. **Capa de Dominio y Servicios**: Implementación de `MaterialRepository` y `MaterialService`, garantizando la verificación server-side de propiedad de la materia (`course.userId === session.user.id`), validación estricta de tipos MIME y límites de tamaño.
4. **Validación y Server Actions**: Creación de schemas Zod (`RequestUploadUrlSchema`, `ConfirmUploadSchema`, `CreateNoteSchema`, `UpdateMaterialSchema`) y Server Actions seguras con revalidación de caché.
5. **Server State en Cliente**: Hooks reactivos de `TanStack Query` (`useMaterials`, `useRequestUploadUrl`, `useConfirmUpload`, `useCreateNote`, `useDeleteMaterial`, `useMaterialDownloadUrl`) con gestión de progreso de subida.
6. **Interfaz de Usuario (Dark Liquid Glass / Mobile-First)**:
   * Zona de carga interactiva (`MaterialUploadZone`) con drag & drop y barra de progreso.
   * Modal de redacción de apuntes (`NoteEditorDialog`).
   * Grilla y listado de materiales (`MaterialList`, `MaterialCard`) con filtros por tipo, iconografía diferenciada y menú contextual.
   * Diálogo de confirmación destructiva (`MaterialDeleteDialog`).
   * Integración en la pestaña *Documentos* de `/courses/[id]`.
7. **Suite de Pruebas y Calidad**: Tests unitarios de schemas, pruebas de `R2StorageAdapter` y `MaterialService` con mocks, pruebas de componentes y checklist de compilación (`typecheck`, `lint`, `test`, `build`).

---

## 2. Decisiones Arquitectónicas y Flujo de Datos

### 2.1 Flujo de Carga y Descarga de Archivos (Direct Presigned URL Pattern)

```text
[Cliente: Vista /courses/[id] (Pestaña Documentos)]
                 │
                 ▼ 1. Solicita Presigned URL (Filename, MIME, FileSize)
[Server Action: requestUploadUrlAction]
                 │
                 ▼ 2. Valida sesión + Verifica propiedad de la materia (course.userId === session.user.id)
[MaterialService & MaterialRepository]
                 │
                 ▼ 3. Crea registro Material (Status: UPLOADED) + Genera Presigned PUT URL en R2 (Expira 10 min)
[Cliente / Navegador]
                 │
                 ▼ 4. Sube binario directamente a Cloudflare R2 (HTTP PUT con Progress Event)
[Cloudflare R2 Bucket]
                 │
                 ▼ 5. Notifica éxito de subida al servidor
[Server Action: confirmUploadAction]
                 │
                 ▼ 6. Actualiza estado a READY en PostgreSQL + Invalida TanStack Query Cache
[PostgreSQL (Supabase) + RLS Policy USING (auth.uid() = user_id)]
```

### 2.2 Principios de Seguridad y Aislamiento
* **Cero Carga en el Servidor Web**: Los archivos binarios pesados (PDFs, audios, PPTs) no atraviesan la API de Next.js; se transmiten directamente entre el cliente y Cloudflare R2 a través de túneles TLS autenticados con presigned URLs temporales.
* **Descarga Protegida**: Los archivos nunca son públicos por defecto. Cada descarga genera una Presigned GET URL temporal con expiración de 15 minutos solo accesible por el propietario.
* **Aislamiento Multi-Tenant**: RLS en PostgreSQL previene accesos indebidos en base de datos, y los prefijos de R2 (`users/{userId}/courses/{courseId}/materials/{materialId}/{filename}`) aíslan el almacenamiento físico.

---

## 3. Desglose Técnico por Módulos

### 3.1 Módulo 1: Dependencias & Configuración de Almacenamiento

#### Dependencias a Instalar:
* `@aws-sdk/client-s3`: Cliente S3 oficial y ligero compatible con Cloudflare R2.
* `@aws-sdk/s3-request-presigner`: Generador de URLs prefirmadas para subida y descarga segura.

#### Configuración de Variables de Entorno (`.env.example` y `.env`):
```env
CLOUDFLARE_R2_ACCOUNT_ID="tu-account-id"
CLOUDFLARE_R2_ACCESS_KEY_ID="tu-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="tu-secret-access-key"
CLOUDFLARE_R2_BUCKET_NAME="university-study-platform"
CLOUDFLARE_R2_PUBLIC_DOMAIN=""
```

#### Adaptador de Storage (`src/services/storage/`):
* `src/services/storage/storage.interface.ts`: Contrato `IStorageAdapter` (`getPresignedUploadUrl`, `getPresignedDownloadUrl`, `deleteObject`, `headObject`).
* `src/services/storage/r2-storage.adapter.ts`: Implementación concreta con `S3Client` apuntando al endpoint `https://${accountId}.r2.cloudflarestorage.com`.

---

### 3.2 Módulo 2: Modelo de Datos, Prisma & Migraciones PostgreSQL

#### Extensión de `prisma/schema.prisma`:
```prisma
enum MaterialType {
  PDF
  PPTX
  AUDIO
  IMAGE
  NOTE
}

enum MaterialStatus {
  UPLOADED
  PROCESSING
  READY
  ERROR
}

model Material {
  id           String         @id @default(uuid()) @db.Uuid
  courseId     String         @map("course_id") @db.Uuid
  userId       String         @map("user_id") @db.Uuid
  title        String         @db.VarChar(200)
  description  String?        @db.Text
  type         MaterialType
  status       MaterialStatus @default(UPLOADED)
  r2Key        String         @map("r2_key") @db.VarChar(500)
  fileSize     Int            @map("file_size")
  mimeType     String         @map("mime_type") @db.VarChar(100)
  textContent  String?        @map("text_content") @db.Text
  errorMessage String?        @map("error_message") @db.Text
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")

  course       Course         @relation(fields: [courseId], references: [id], onDelete: Cascade)
  user         Profile        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([courseId])
  @@index([userId])
  @@index([courseId, type])
  @@index([courseId, status])
  @@map("materials")
}
```

#### Migración SQL Versionada (`prisma/migrations/2_add_materials/migration.sql`):
1. Creación de enums `MaterialType` y `MaterialStatus`.
2. Creación de tabla `public.materials`.
3. Claves foráneas hacia `public.courses` y `public.profiles` con `ON DELETE CASCADE`.
4. Habilitación de RLS con políticas SELECT, INSERT, UPDATE, DELETE basadas en `auth.uid() = user_id`.

#### Tipos del Dominio (`src/types/material.ts`):
* `MaterialType`, `MaterialStatus`, `Material`, `PresignedUploadResult`, `MaterialFilter`.

---

### 3.3 Módulo 3: Repositorio y Servicio de Aplicación

#### Repositorio (`src/repositories/material.repository.ts`):
* `findById(id: string): Promise<Material | null>`
* `findAllByCourseId(courseId: string, type?: MaterialType): Promise<Material[]>`
* `create(data: Omit<Material, 'createdAt' | 'updatedAt'>): Promise<Material>`
* `update(id: string, data: Partial<Material>): Promise<Material>`
* `delete(id: string): Promise<void>`
* `countByCourseId(courseId: string): Promise<number>`

#### Servicio (`src/services/material/material.service.ts`):
* `requestUploadUrl(userId: string, input: RequestUploadUrlInput): Promise<PresignedUploadResult>`
* `confirmUpload(userId: string, materialId: string): Promise<Material>`
* `createNote(userId: string, input: CreateNoteInput): Promise<Material>`
* `getMaterialsByCourse(userId: string, courseId: string, type?: MaterialType): Promise<Material[]>`
* `getDownloadUrl(userId: string, materialId: string): Promise<string>`
* `updateMaterial(userId: string, materialId: string, input: UpdateMaterialInput): Promise<Material>`
* `deleteMaterial(userId: string, materialId: string): Promise<void>`

---

### 3.4 Módulo 4: Schemas Zod, Server Actions y Hooks de TanStack Query

#### Schemas Zod (`src/features/material/schemas/material.schema.ts`):
* `RequestUploadUrlSchema`: Validación de filename, fileSize (límites por formato) y mimeType admitido.
* `ConfirmUploadSchema`: Validación de UUID de material.
* `CreateNoteSchema`: Título (2 a 200 chars) y contenido (5 a 50.000 chars).
* `UpdateMaterialSchema`: Título y descripción opcionales.

#### Server Actions (`src/features/material/actions/material.actions.ts`):
* `requestUploadUrlAction(rawInput: RequestUploadUrlInput)`
* `confirmUploadAction(rawInput: ConfirmUploadInput)`
* `createNoteAction(rawInput: CreateNoteInput)`
* `getMaterialsAction(courseId: string, type?: MaterialType)`
* `getMaterialDownloadUrlAction(materialId: string)`
* `updateMaterialAction(materialId: string, rawInput: UpdateMaterialInput)`
* `deleteMaterialAction(materialId: string)`

#### Client Hooks (`src/features/material/hooks/use-materials.ts`):
* `useMaterials(courseId: string, type?: MaterialType)`
* `useRequestUploadUrl()`
* `useConfirmUpload()`
* `useCreateNote()`
* `useDeleteMaterial()`
* `useMaterialDownloadUrl()`
* `useUploadFileWithProgress()`: Hook compuesto para subida directa XMLHttpRequest con callback de porcentaje (0% a 100%).

---

### 3.5 Módulo 5: Componentes UI de Materiales (Dark Liquid Glass)

#### Componentes:
1. **`MaterialTypeBadge` (`src/components/materials/MaterialTypeBadge.tsx`)**:
   * Insignia sutil con color temático según tipo (PDF en carmesí, PPTX en ámbar, Audio en índigo, Imagen en esmeralda, Nota en azul cielo).
2. **`MaterialCard` (`src/components/materials/MaterialCard.tsx`)**:
   * Tarjeta/Fila con cristal esmerilado, icono según formato, título, tamaño legible, fecha relativa y menú contextual (*Descargar*, *Editar*, *Eliminar*).
3. **`MaterialUploadZone` (`src/components/materials/MaterialUploadZone.tsx`)**:
   * Dropzone interactiva con soporte drag & drop, botón selector y botón secundario "Crear apunte de texto".
   * Barra de progreso animada durante la subida con porcentaje.
4. **`NoteEditorDialog` (`src/components/materials/NoteEditorDialog.tsx`)**:
   * Modal responsivo para redactar notas con conteo de caracteres en tiempo real.
5. **`MaterialDeleteDialog` (`src/components/materials/MaterialDeleteDialog.tsx`)**:
   * Diálogo de confirmación destructiva para eliminar archivos en R2 y DB.
6. **`MaterialList` (`src/components/materials/MaterialList.tsx`)**:
   * Barra de filtros por tipo (*Todos*, *PDFs*, *Presentaciones*, *Audios*, *Imágenes*, *Notas*) y buscador.
7. **Integración en `CourseTabs.tsx`**:
   * Reemplazar el `EmptyState` placeholder de la pestaña "Documentos" por `MaterialUploadZone` y `MaterialList`.

---

## 4. Estrategia de Testing y Verificación

### 4.1 Tests Unitarios
* `src/features/material/schemas/__tests__/material.schema.test.ts`: Validación de tipos MIME, tamaños máximos y límites de notas.
* `src/services/storage/__tests__/r2-storage.adapter.test.ts`: Pruebas de generación de Presigned URLs y llamadas a S3 mockeadas.
* `src/services/material/__tests__/material.service.test.ts`: Pruebas de autorización, rechazo de archivos ajenos, confirmación y borrado.

### 4.2 Tests de Componentes
* `src/components/materials/__tests__/MaterialCard.test.tsx`: Renderizado correcto de iconos, tamaños y eventos de menú.

### 4.3 Checklist Automatizado
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

---

## 5. Matriz de Riesgos Técnicos y Mitigaciones

| Riesgo Técnico | Impacto | Mitigación Planificada |
| :--- | :---: | :--- |
| **Archivos huérfanos en R2 si el cliente no confirma la subida** | Bajo | El registro se crea inicialmente en estado `UPLOADED`. En un cronjob futuro se limpiarán registros no confirmados tras 24h. |
| **Subida de tipos de archivo maliciosos o ejecutables** | Crítico | Validación estricta de `mimeType` y extensión con Zod en el servidor antes de generar la presigned URL, forzando `ContentType` en el encabezado de S3. |
| **Expiración de URLs de descarga en enlaces compartidos** | Bajo | Las Presigned Download URLs son temporales (15 min) y se obtienen bajo demanda vía Server Action. |
| **Falta de credenciales de Cloudflare R2 en entorno local** | Medio | Si las variables de R2 no están presentes, el adaptador ofrece un modo fallback seguro para desarrollo local con advertencias claras. |
