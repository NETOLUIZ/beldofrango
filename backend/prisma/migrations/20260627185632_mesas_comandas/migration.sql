-- CreateEnum
CREATE TYPE "TipoPedido" AS ENUM ('ENTREGA', 'MESA', 'RETIRADA');

-- CreateEnum
CREATE TYPE "StatusMesa" AS ENUM ('LIVRE', 'OCUPADA', 'RESERVADA', 'CONTA');

-- AlterEnum
ALTER TYPE "FormaPagamento" ADD VALUE 'DINHEIRO';

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "mesaId" INTEGER,
ADD COLUMN     "tipo" "TipoPedido" NOT NULL DEFAULT 'ENTREGA',
ALTER COLUMN "telefone" DROP NOT NULL,
ALTER COLUMN "endereco" DROP NOT NULL,
ALTER COLUMN "formaPagamento" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Mesa" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "lugares" INTEGER NOT NULL DEFAULT 4,
    "status" "StatusMesa" NOT NULL DEFAULT 'LIVRE',
    "clienteNome" TEXT,
    "abertaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mesa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mesa_numero_key" ON "Mesa"("numero");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "Mesa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
