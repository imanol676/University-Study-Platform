# SPEC-003: Course Materials & Object Storage

| Metadata | Detalle |
| :--- | :--- |
| **ID** | `SPEC-003` |
| **Título** | Gestión de Materiales de Estudio, Almacenamiento en Cloudflare R2 y Carga de Archivos |
| **Estado** | `Ready for Implementation` |
| **Fecha de Creación** | 2026-09-01 |
| **Versión** | 1.0.0 |
| **Autor/Contexto** | SDD — University Study Platform |
| **Documentos Relacionados** | [`docs/constitution.md`](../constitution.md), [`AGENTS.md`](../../AGENTS.md), [`docs/specs/001-project-fundation.md`](./001-project-fundation.md), [`docs/specs/002-course-management.md`](./002-course-management.md) |

---

## 1. Resumen Ejecutivo y Propósito

En **University Study Platform**, los **materiales de estudio** (documentos PDF, presentaciones PowerPoint, apuntes en texto/notas, grabaciones de audio e imágenes) constituyen la materia prima sobre la cual la plataforma construye el contexto académico RAG para generar sesiones de estudio personalizadas y active recall (Sección 9 de la `constitution.md`).

El objetivo de esta especificación es implementar el sistema integral de **Gestión de Materiales y Almacenamiento**:
1. Diseñar el modelo de datos de `Material` en PostgreSQL (Prisma ORM) con aislamiento estricto por usuario (`user_id`) y por materia (`course_id`), reforzado por **Row Level Security (RLS)**.
2. Integrar **Cloudflare R2** como proveedor de almacenamiento de objetos S3-compatible, implementando un adaptador desacoplado (`R2StorageAdapter`) que genere URLs prefirmadas seguras para la carga y descarga directa de archivos sin saturar el servidor Next.js.
3. Desarrollar la capa de aplicación (`MaterialService`) y repositorio (`MaterialRepository`) para validar tamaños, tipos MIME permitidos y propiedad de las materias antes de autorizar cualquier carga.
4. Diseñar e implementar la interfaz de usuario en la pestaña **Documentos** de la vista de detalle de materia (`/courses/[id]`), incorporando una zona de carga interactiva (Dropzone con drag & drop), subida de apuntes de texto, filtrado por tipo de material y confirmaciones de eliminación, todo bajo la estética **Modo Oscuro con Apple Liquid Glass**.
5. Establecer la base de metadatos necesaria para que la siguiente especificación (`SPEC-004: Ingestion & Vector Pipeline`) pueda procesar los documentos y generar fragmentos (chunks) y embeddings.

---

## 2. Alcance (Scope)

### 2.1 Dentro del Alcance (In Scope)

* **Tipos de Materiales Soportados y Límites**:
  * **Documentos PDF** (`application/pdf`): hasta 25 MB.
  * **Presentaciones PPT / PPTX** (`application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`): hasta 25 MB.
  * **Audios** (`audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/m4a`, `audio/x-m4a`, `audio/ogg`, `audio/webm`): hasta 50 MB.
  * **Imágenes** (`image/png`, `image/jpeg`, `image/webp`): hasta 10 MB.
  * **Notas / Apuntes de Texto** (Markdown / Texto enriquecido o plano redactado en la app): hasta 2 MB.

* **Almacenamiento de Objetos en Cloudflare R2**:
  * Configuración del SDK de S3 (`@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner`) configurado para el endpoint de Cloudflare R2.
  * Estructura de claves (keys) de objetos aislada y predecible:
    `users/{userId}/courses/{courseId}/materials/{materialId}/{filename}`.
  * Flujo de subida directa cliente -> R2 mediante **Presigned Upload URLs** (HTTP `PUT`).
  * Generación de **Presigned Download / Preview URLs** temporales (expiración configurable, ej. 15 minutos) para proteger el contenido académico de accesos no autorizados.
  * Eliminación atómica del objeto en R2 al borrar el registro en la base de datos.

* **Modelo de Datos y Base de Datos (Prisma & PostgreSQL)**:
  * Enums `MaterialType` (`PDF`, `PPTX`, `AUDIO`, `IMAGE`, `NOTE`) y `MaterialStatus` (`UPLOADED`, `PROCESSING`, `READY`, `ERROR`).
  * Tabla `materials` con claves foráneas en cascada hacia `courses(id)` y `profiles(id)`.
  * Índices por `course_id`, `user_id` y `[course_id, type]`.
  * Políticas de Row Level Security (RLS) que limitan todas las operaciones a `auth.uid() = user_id`.

* **Servicios de Aplicación y Server Actions**:
  * `MaterialRepository`: abstracción de persistencia para operaciones CRUD de materiales.
  * `MaterialService`: orquesta la autorización, validación de cuotas/tamaños, solicitud de URLs prefirmadas a R2 y actualización de metadatos.
  * Server Actions:
    * `requestUploadUrlAction`: Valida el tipo y tamaño, crea el registro en estado `UPLOADED` y genera la presigned URL de subida.
    * `confirmUploadAction`: Verifica la subida del archivo y actualiza el estado a `READY`.
    * `createNoteAction`: Permite crear apuntes de texto directos asociados a la materia.
    * `getMaterialsAction`: Obtiene el listado de materiales de la materia con filtros opcionales.
    * `getMaterialDownloadUrlAction`: Retorna la URL prefirmada temporal para visualizar o descargar el archivo.
    * `deleteMaterialAction`: Elimina el archivo en R2 y el registro en base de datos.

* **Gestión de Estado Reactivo en Cliente (TanStack Query)**:
  * Hooks: `useMaterials`, `useRequestUploadUrl`, `useConfirmUpload`, `useCreateNote`, `useDeleteMaterial`, `useMaterialDownloadUrl`.
  * Progreso de carga en cliente (XHR / Fetch upload progress) con feedback visual fluido.

* **Interfaz de Usuario (Dark Liquid Glass / Mobile-First)**:
  * **Zona de Carga (`MaterialUploadZone`)**:
    * Dropzone visual con drag & drop y botón explorador de archivos.
    * Indicadores de formatos aceptados y límites de tamaño.
    * Barra de progreso de carga y estados de éxito/error con toasts de Sonner.
  * **Modal de Creación de Apuntes (`NoteEditorDialog`)**:
    * Formulario para redactar notas de clase o pegar texto plano/markdown con previsualización.
  * **Listado de Materiales (`MaterialList` / `MaterialCard`)**:
    * Filtros rápidos por tipo de material (*Todos*, *PDFs*, *Presentaciones*, *Audios*, *Imágenes*, *Notas*).
    * Iconografía sobria y colorimetría profesional según el tipo de archivo.
    * Metadatos visibles: Nombre del archivo, tamaño legible (ej: "4.2 MB"), fecha de subida y estado.
    * Menú contextual: Descargar / Ver, Editar título y Eliminar.
  * **Diálogo de Confirmación Destructiva (`MaterialDeleteDialog`)**.
  * Actualización de la pestaña *Documentos* en `/courses/[id]` y del contador de materiales en las tarjetas de materia.

### 2.2 Fuera del Alcance (Out of Scope)

* Extracción de texto en profundidad, parsing de PDFs y transcripción de audios con Whisper (corresponde a `SPEC-004: Ingestion & Vector Pipeline`).
* Segmentación de texto (chunking) y generación de embeddings vectoriales con pgvector (corresponde a `SPEC-004`).
* Generación de preguntas de Active Recall o podcasts/diálogos con Azure TTS/STT (corresponde a `SPEC-005: Active Recall Engine`).
* OCR avanzado para imágenes complejas o fórmulas manuscritas (diferido a fase de procesamiento de IA).

---

## 3. Arquitectura del Módulo y Flujo de Almacenamiento

### 3.1 Flujo de Carga Directa a Cloudflare R2 (Presigned URL Pattern)

Para no saturar el servidor Next.js ni incurrir en cuellos de botella de ancho de banda o límites de payload de Serverless/Node:

```text
[Cliente / Navegador]
       │
       │ 1. Solicita presigned URL (Nombre, tipo MIME, tamaño)
       ▼
[Server Action: requestUploadUrlAction]
       │
       │ 2. Valida sesión + Verifica que la materia pertenezca al usuario
       ▼
[MaterialService & StorageAdapter]
       │
       │ 3. Genera Presigned PUT URL en Cloudflare R2 (Expira en 10 min)
       │    + Inserta registro "Material" (Status: UPLOADED) en PostgreSQL
       ▼
[Cliente / Navegador]
       │
       │ 4. Sube el archivo binario directamente a Cloudflare R2 (HTTP PUT)
       ▼
[Cloudflare R2 Bucket]
       │
       │ 5. Cliente notifica éxito con confirmUploadAction
       ▼
[Server Action: confirmUploadAction]
       │
       │ 6. Actualiza estado a READY en PostgreSQL + Invalida TanStack Query
       ▼
[Interfaz / React UI actualizada]
```

### 3.2 Estructura de Directorios del Módulo

```text
src/
├── components/
│   └── materials/
│       ├── MaterialUploadZone.tsx      # Zona Dropzone con Drag & Drop y barra de progreso
│       ├── MaterialList.tsx            # Lista/Grilla de materiales con buscador y filtros
│       ├── MaterialCard.tsx            # Tarjeta/Fila individual de material con menú contextual
│       ├── NoteEditorDialog.tsx        # Modal para crear y editar apuntes de texto directo
│       ├── MaterialDeleteDialog.tsx    # Confirmación destructiva de borrado de archivo
│       └── MaterialTypeBadge.tsx       # Insignia sobria por tipo de archivo
├── features/
│   └── material/
│       ├── actions/
│       │   └── material.actions.ts     # Server Actions para carga, confirmación y borrado
│       ├── hooks/
│       │   └── use-materials.ts        # Hooks cliente TanStack Query
│       └── schemas/
│           └── material.schema.ts      # Validaciones Zod de archivos, notas y metadatos
├── services/
│   ├── material/
│   │   ├── material.service.ts         # MaterialService (Lógica de negocio y verificación)
│   │   └── __tests__/
│   │       └── material.service.test.ts # Tests unitarios de MaterialService
│   └── storage/
│       ├── storage.interface.ts        # IStorageAdapter contrato de almacenamiento
│       ├── r2-storage.adapter.ts       # Adaptador concreto de Cloudflare R2 (S3 Client)
│       └── __tests__/
│           └── r2-storage.adapter.test.ts # Tests unitarios con S3Client mockeado
├── repositories/
│   └── material.repository.ts          # MaterialRepository (Acceso Prisma a tabla materials)
└── types/
    └── material.ts                     # Interfaces y tipos de dominio de materiales
```

---

## 4. Modelo de Datos (Prisma & PostgreSQL)

### 4.1 Schema de Prisma (`prisma/schema.prisma`)

```prisma
enum MaterialType {
  PDF
  PPTX
  AUDIO
  IMAGE
  NOTE
}

enum MaterialStatus {
  UPLOADED    // Presigned URL generada, subida iniciada
  PROCESSING  // Reservado para SPEC-004 (ingesta/vectorización)
  READY       // Archivo confirmado y listo para lectura/estudio
  ERROR       // Error en la carga o validación
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
  fileSize     Int            @map("file_size") // En bytes
  mimeType     String         @map("mime_type") @db.VarChar(100)
  textContent  String?        @map("text_content") @db.Text // Para notas directas
  errorMessage String?        @map("error_message") @db.Text
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")

  // Relaciones
  course       Course         @relation(fields: [courseId], references: [id], onDelete: Cascade)
  user         Profile        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([courseId])
  @@index([userId])
  @@index([courseId, type])
  @@index([courseId, status])
  @@map("materials")
}
```

En el modelo `Course`:
```prisma
model Course {
  // ... campos existentes
  materials   Material[]

  @@map("courses")
}
```

En el modelo `Profile`:
```prisma
model Profile {
  // ... campos existentes
  materials   Material[]

  @@map("profiles")
}
```

### 4.2 Migración SQL y Políticas RLS (`prisma/migrations/2_add_materials/migration.sql`)

```sql
-- 1. Crear Enums
CREATE TYPE "MaterialType" AS ENUM ('PDF', 'PPTX', 'AUDIO', 'IMAGE', 'NOTE');
CREATE TYPE "MaterialStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'ERROR');

-- 2. Crear Tabla materials
CREATE TABLE "public"."materials" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "type" "MaterialType" NOT NULL,
    "status" "MaterialStatus" NOT NULL DEFAULT 'UPLOADED',
    "r2_key" VARCHAR(500) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "text_content" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- 3. Índices de rendimiento
CREATE INDEX "materials_course_id_idx" ON "public"."materials"("course_id");
CREATE INDEX "materials_user_id_idx" ON "public"."materials"("user_id");
CREATE INDEX "materials_course_id_type_idx" ON "public"."materials"("course_id", "type");
CREATE INDEX "materials_course_id_status_idx" ON "public"."materials"("course_id", "status");

-- 4. Claves foráneas con eliminación en cascada
ALTER TABLE "public"."materials" 
ADD CONSTRAINT "fk_materials_course" 
FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."materials" 
ADD CONSTRAINT "fk_materials_user" 
FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE "public"."materials" ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS
CREATE POLICY "Users can view own materials" 
ON "public"."materials" 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own materials" 
ON "public"."materials" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own materials" 
ON "public"."materials" 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own materials" 
ON "public"."materials" 
FOR DELETE 
USING (auth.uid() = user_id);
```

---

## 5. Contratos de Código e Interfaces Técnicas

### 5.1 Tipos de Dominio (`src/types/material.ts`)

```typescript
export type MaterialType = 'PDF' | 'PPTX' | 'AUDIO' | 'IMAGE' | 'NOTE';
export type MaterialStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'ERROR';

export interface Material {
  id: string;
  courseId: string;
  userId: string;
  title: string;
  description: string | null;
  type: MaterialType;
  status: MaterialStatus;
  r2Key: string;
  fileSize: number;
  mimeType: string;
  textContent: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PresignedUploadResult {
  materialId: string;
  uploadUrl: string;
  r2Key: string;
  expiresInSeconds: number;
}
```

### 5.2 Contrato del Adaptador de Storage (`src/services/storage/storage.interface.ts`)

```typescript
export interface IStorageAdapter {
  getPresignedUploadUrl(params: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<string>;

  getPresignedDownloadUrl(params: {
    key: string;
    filename?: string;
    expiresInSeconds?: number;
  }): Promise<string>;

  deleteObject(key: string): Promise<void>;
  headObject(key: string): Promise<{ exists: boolean; contentLength?: number }>;
}
```

### 5.3 Esquemas de Validación Zod (`src/features/material/schemas/material.schema.ts`)

```typescript
import { z } from 'zod';

export const ALLOWED_MIME_TYPES = {
  PDF: ['application/pdf'],
  PPTX: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  AUDIO: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/m4a',
    'audio/x-m4a',
    'audio/ogg',
    'audio/webm',
  ],
  IMAGE: ['image/png', 'image/jpeg', 'image/webp'],
  NOTE: ['text/plain', 'text/markdown'],
} as const;

export const MAX_FILE_SIZES = {
  PDF: 25 * 1024 * 1024,   // 25 MB
  PPTX: 25 * 1024 * 1024,  // 25 MB
  AUDIO: 50 * 1024 * 1024, // 50 MB
  IMAGE: 10 * 1024 * 1024, // 10 MB
  NOTE: 2 * 1024 * 1024,   // 2 MB
} as const;

export const RequestUploadUrlSchema = z.object({
  courseId: z.string().uuid('ID de materia inválido'),
  filename: z.string().min(1, 'El nombre del archivo es obligatorio').max(200),
  fileSize: z.number().int().positive('El archivo no puede estar vacío'),
  mimeType: z.string().min(1, 'El tipo MIME es obligatorio'),
});

export const ConfirmUploadSchema = z.object({
  materialId: z.string().uuid('ID de material inválido'),
});

export const CreateNoteSchema = z.object({
  courseId: z.string().uuid('ID de materia inválido'),
  title: z.string().trim().min(2, 'El título debe tener al menos 2 caracteres').max(200),
  content: z.string().trim().min(5, 'La nota debe tener al menos 5 caracteres').max(50000),
});

export const UpdateMaterialSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(500).optional().nullable(),
});

export type RequestUploadUrlInput = z.infer<typeof RequestUploadUrlSchema>;
export type ConfirmUploadInput = z.infer<typeof ConfirmUploadSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateMaterialInput = z.infer<typeof UpdateMaterialSchema>;
```

### 5.4 Repositorio y Servicio (`src/repositories/` y `src/services/`)

```typescript
// src/repositories/material.repository.ts
export interface IMaterialRepository {
  findById(id: string): Promise<Material | null>;
  findAllByCourseId(courseId: string, type?: MaterialType): Promise<Material[]>;
  create(data: Omit<Material, 'createdAt' | 'updatedAt'>): Promise<Material>;
  update(id: string, data: Partial<Material>): Promise<Material>;
  delete(id: string): Promise<void>;
  countByCourseId(courseId: string): Promise<number>;
}

// src/services/material/material.service.ts
export interface IMaterialService {
  requestUploadUrl(userId: string, input: RequestUploadUrlInput): Promise<PresignedUploadResult>;
  confirmUpload(userId: string, materialId: string): Promise<Material>;
  createNote(userId: string, input: CreateNoteInput): Promise<Material>;
  getMaterialsByCourse(userId: string, courseId: string, type?: MaterialType): Promise<Material[]>;
  getDownloadUrl(userId: string, materialId: string): Promise<string>;
  updateMaterial(userId: string, materialId: string, input: UpdateMaterialInput): Promise<Material>;
  deleteMaterial(userId: string, materialId: string): Promise<void>;
}
```

---

## 6. Variables de Entorno Requeridas

Para la integración con Cloudflare R2 (S3-compatible API):

```env
# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCOUNT_ID="tu-account-id"
CLOUDFLARE_R2_ACCESS_KEY_ID="tu-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="tu-secret-access-key"
CLOUDFLARE_R2_BUCKET_NAME="university-study-platform"
CLOUDFLARE_R2_PUBLIC_DOMAIN="" # Opcional si se usa dominio personalizado, por defecto se usan Presigned URLs
```

> **Nota de Seguridad**: `CLOUDFLARE_R2_ACCESS_KEY_ID` y `CLOUDFLARE_R2_SECRET_ACCESS_KEY` **nunca** deben exponerse en el cliente (`NEXT_PUBLIC_`). Su uso se limita estrictamente a la capa de servidor mediante `R2StorageAdapter`.

---

## 7. Diseño de UI/UX (Modo Oscuro con Apple Liquid Glass)

### 7.1 Componentes en `/courses/[id]` (Pestaña "Documentos")

1. **`MaterialUploadZone` (Dropzone)**:
   * Contenedor de cristal translúcido con borde punteado suave (`border-dashed border-white/[0.15] bg-slate-900/30 backdrop-blur-xl hover:border-primary/50`).
   * Soporte para arrastrar y soltar (Drag & Drop) y botón selector tradicional.
   * Botón secundario para abrir el editor de notas de texto (`NoteEditorDialog`).
   * Barra de progreso animada durante la subida con porcentaje y velocidad estimada.

2. **`MaterialList` & `MaterialCard`**:
   * Filtros sobrios por tipo: *Todos*, *PDFs*, *Presentaciones*, *Audios*, *Imágenes*, *Notas*.
   * Iconografía distintiva por tipo:
     * **PDF**: Rojo carmesí sutil (`FileText`, `text-rose-400 bg-rose-500/10 border-rose-500/20`).
     * **PPTX**: Naranja ámbar (`Presentation`, `text-amber-400 bg-amber-500/10 border-amber-500/20`).
     * **Audio**: Violeta índigo (`Headphones` / `Volume2`, `text-indigo-400 bg-indigo-500/10 border-indigo-500/20`).
     * **Imagen**: Verde esmeralda (`Image`, `text-emerald-400 bg-emerald-500/10 border-emerald-500/20`).
     * **Nota**: Azul cielo (`FileCode` / `StickyNote`, `text-sky-400 bg-sky-500/10 border-sky-500/20`).
   * Menú contextual de tres puntos:
     * *Abrir / Descargar* (obtiene presigned download URL y abre en pestaña segura).
     * *Editar título*.
     * *Eliminar* (abre `MaterialDeleteDialog`).

3. **`NoteEditorDialog`**:
   * Diálogo modal para escribir o pegar resúmenes, apuntes o temarios de clase.
   * Conteo de caracteres y validación en vivo.

---

## 8. Criterios de Aceptación (Acceptance Criteria)

### 8.1 Persistencia y R2 Storage
* [ ] El modelo `Material` y los enums `MaterialType` y `MaterialStatus` están definidos en `schema.prisma`.
* [ ] La migración de base de datos se genera y aplica limpiamente con RLS activado.
* [ ] `R2StorageAdapter` genera URLs prefirmadas de subida (`PUT`) y descarga (`GET`) válidas y funcionales contra Cloudflare R2.

### 8.2 Carga y Gestión de Archivos
* [ ] **Subida Directa**: El usuario puede arrastrar o seleccionar un archivo (PDF, PPTX, Audio, Imagen). La subida se realiza directamente a R2 y el registro queda en estado `READY`.
* [ ] **Validación de Tipos y Tamaños**: Si el usuario intenta subir un formato no admitido o un archivo que excede los límites (ej. PDF > 25MB), el sistema rechaza la solicitud en cliente y servidor con un mensaje amigable.
* [ ] **Creación de Notas**: El estudiante puede crear apuntes de texto directos asociados a la materia.
* [ ] **Listado y Filtros**: En la pestaña *Documentos*, los materiales se listan ordenados por fecha y se pueden filtrar por tipo en tiempo real.
* [ ] **Descarga / Previsualización Segura**: Al hacer clic en descargar/abrir, se genera una URL prefirmada temporal con expiración.
* [ ] **Eliminación Atómica**: Al eliminar un material, se borra el archivo en Cloudflare R2 y el registro en la base de datos de forma segura.

### 8.3 Seguridad y Aislamiento Multi-Tenant
* [ ] Ningún usuario puede subir, listar, descargar o eliminar materiales de materias pertenecientes a otro usuario.
* [ ] Las credenciales de Cloudflare R2 permanecen 100% confinadas al entorno de servidor.

---

## 9. Plan de Verificación y Testing

### 9.1 Pruebas Automatizadas
1. **Typecheck & Lint**:
   ```bash
   npm run typecheck
   npm run lint
   ```
2. **Pruebas Unitarias**:
   ```bash
   npm test
   ```
   * Validación de schemas Zod (`RequestUploadUrlSchema`, `CreateNoteSchema`, `ALLOWED_MIME_TYPES`, `MAX_FILE_SIZES`).
   * Tests unitarios de `R2StorageAdapter` con mock del cliente S3.
   * Tests unitarios de `MaterialService` (autorización de materias, denegación por usuario incorrecto, flujo de confirmación y borrado).
3. **Pruebas de Componentes**:
   * Renderizado de `MaterialUploadZone`, `MaterialCard` y `NoteEditorDialog`.
4. **Build de Producción**:
   ```bash
   npm run build
   ```

### 9.2 Verificación Manual
1. Iniciar sesión y acceder a una materia en `/courses/[id]`.
2. Subir un archivo PDF válido -> Verificar progreso y visualización inmediata en la lista con badge PDF.
3. Subir un archivo de audio (MP3) -> Verificar visualización con badge Audio.
4. Crear una nota de apuntes desde el modal -> Verificar renderizado con badge Nota.
5. Intentar subir un archivo ejecutable o inválido -> Verificar rechazo inmediato con mensaje claro.
6. Hacer clic en "Descargar" en un archivo -> Verificar apertura en pestaña segura mediante presigned URL.
7. Eliminar un archivo -> Verificar diálogo de confirmación y remoción del listado.
