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

-- 6. Políticas RLS para aislamiento multi-tenant
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
