-- CreateEnum
CREATE TYPE "CurrencyStyle" AS ENUM ('USD', 'EUR');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "currencyStyle" "CurrencyStyle" DEFAULT 'USD';
