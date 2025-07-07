/*
  Warnings:

  - You are about to drop the column `category_id` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_category_id_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category_id";

-- CreateTable
CREATE TABLE "ProductCategoryRelation" (
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ProductCategoryRelation_pkey" PRIMARY KEY ("productId","categoryId")
);

-- AddForeignKey
ALTER TABLE "ProductCategoryRelation" ADD CONSTRAINT "ProductCategoryRelation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategoryRelation" ADD CONSTRAINT "ProductCategoryRelation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;
