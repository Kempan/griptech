/*
  Warnings:

  - You are about to drop the column `wibo_product_data` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `wibo_category_id` on the `ProductCategory` table. All the data in the column will be lost.
  - You are about to drop the column `wibo_data` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "wibo_product_data",
ADD COLUMN     "enable_stock_management" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ProductCategory" DROP COLUMN "wibo_category_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "wibo_data";
