-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "foto" TEXT;

-- CreateTable
CREATE TABLE "Caixa" (
    "id" SERIAL NOT NULL,
    "valorInicial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "abertoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechadoEm" TIMESTAMP(3),
    "totalVendas" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Caixa_pkey" PRIMARY KEY ("id")
);
