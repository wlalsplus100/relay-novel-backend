-- AlterTable
ALTER TABLE "Participation" ADD COLUMN     "isSkipped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "turnGivenAt" TIMESTAMP(3);
