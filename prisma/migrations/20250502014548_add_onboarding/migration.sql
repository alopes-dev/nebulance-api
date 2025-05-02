-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "currency" TEXT DEFAULT 'USD',
ADD COLUMN     "isSetup" BOOLEAN NOT NULL DEFAULT false;
