/*
  Warnings:

  - You are about to drop the column `preferences` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "preferences",
ADD COLUMN     "wibo_data" JSONB;
