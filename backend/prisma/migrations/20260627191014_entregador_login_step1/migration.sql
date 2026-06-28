-- DropIndex
DROP INDEX "Entregador_token_key";

-- AlterTable
ALTER TABLE "Entregador" DROP COLUMN "token",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "senha" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Entregador_email_key" ON "Entregador"("email");

