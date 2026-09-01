-- CreateEnum
CREATE TYPE "CourseColor" AS ENUM ('INDIGO', 'BLUE', 'EMERALD', 'AMBER', 'ROSE', 'PURPLE', 'SLATE', 'CYAN');

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "code" VARCHAR(30),
    "description" TEXT,
    "term" VARCHAR(60),
    "color" "CourseColor" NOT NULL DEFAULT 'INDIGO',
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courses_user_id_idx" ON "public"."courses"("user_id");

-- CreateIndex
CREATE INDEX "courses_user_id_is_archived_idx" ON "public"."courses"("user_id", "is_archived");

-- AddForeignKey
ALTER TABLE "public"."courses" 
ADD CONSTRAINT "fk_courses_user" 
FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Row Level Security (RLS)
ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own courses" 
ON "public"."courses" 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own courses" 
ON "public"."courses" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses" 
ON "public"."courses" 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses" 
ON "public"."courses" 
FOR DELETE 
USING (auth.uid() = user_id);
