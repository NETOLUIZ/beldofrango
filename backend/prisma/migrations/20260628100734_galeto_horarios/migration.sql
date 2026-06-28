-- AlterTable
ALTER TABLE "Configuracao" ADD COLUMN     "galetoHorarioFim" TEXT NOT NULL DEFAULT '20:00',
ADD COLUMN     "galetoHorarioInicio" TEXT NOT NULL DEFAULT '10:00';

