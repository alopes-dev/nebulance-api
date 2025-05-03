/*
  Warnings:

  - The `currencyStyle` column on the `Account` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "currencyStyle",
ADD COLUMN     "currencyStyle" TEXT DEFAULT 'USD';

-- DropEnum
DROP TYPE "CurrencyStyle";
