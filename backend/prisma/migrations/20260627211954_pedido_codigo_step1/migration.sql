-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "codigoAcompanhamento" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_codigoAcompanhamento_key" ON "Pedido"("codigoAcompanhamento");

