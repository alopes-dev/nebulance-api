/*
  Warnings:

  - You are about to drop the column `isSetup` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "isSetup";

-- DropEnum
DROP TYPE "AccountType";
