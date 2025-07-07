-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "ProductCategories" (
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "ProductCategories_pkey" PRIMARY KEY ("categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategories_slug_key" ON "ProductCategories"("slug");

-- AddForeignKey
ALTER TABLE "ProductCategories" ADD CONSTRAINT "ProductCategories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProductCategories"("categoryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategories"("categoryId") ON DELETE SET NULL ON UPDATE CASCADE;
