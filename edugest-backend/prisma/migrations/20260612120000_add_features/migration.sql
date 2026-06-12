-- CreateEnum
CREATE TYPE "CategoriaDocumento" AS ENUM ('FOTO_ESTUDIANTE', 'COMPROBANTE_PAGO', 'DOCUMENTO_INSTITUCIONAL', 'OTRO');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "resetToken" TEXT,
ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "cursos" ADD COLUMN "cupo" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "facturas" ADD COLUMN "pdfUrl" TEXT;

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "categoria" "CategoriaDocumento" NOT NULL DEFAULT 'OTRO',
    "mimeType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estudianteId" TEXT,
    "subidoPorId" TEXT,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_estudianteId_cursoId_gestion_key" ON "inscripciones"("estudianteId", "cursoId", "gestion");

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "estudiantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
