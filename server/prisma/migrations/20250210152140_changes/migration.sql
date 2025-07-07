/*
  Warnings:

  - The primary key for the `ExpenseByCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `expenseByCategoryId` on the `ExpenseByCategory` table. All the data in the column will be lost.
  - You are about to drop the column `expenseSummaryId` on the `ExpenseByCategory` table. All the data in the column will be lost.
  - The primary key for the `ExpenseSummary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `expenseSummaryId` on the `ExpenseSummary` table. All the data in the column will be lost.
  - You are about to drop the column `totalExpenses` on the `ExpenseSummary` table. All the data in the column will be lost.
  - The primary key for the `PurchaseSummary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `changePercentage` on the `PurchaseSummary` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseSummaryId` on the `PurchaseSummary` table. All the data in the column will be lost.
  - You are about to drop the column `totalPurchased` on the `PurchaseSummary` table. All the data in the column will be lost.
  - The primary key for the `SalesSummary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `changePercentage` on the `SalesSummary` table. All the data in the column will be lost.
  - You are about to drop the column `salesSummaryId` on the `SalesSummary` table. All the data in the column will be lost.
  - You are about to drop the column `totalValue` on the `SalesSummary` table. All the data in the column will be lost.
  - You are about to drop the `Expenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductCategories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Purchases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.
  - The required column `expense_by_category_id` was added to the `ExpenseByCategory` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `expense_summary_id` to the `ExpenseByCategory` table without a default value. This is not possible if the table is not empty.
  - The required column `expense_summary_id` was added to the `ExpenseSummary` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `total_expenses` to the `ExpenseSummary` table without a default value. This is not possible if the table is not empty.
  - The required column `purchase_summary_id` was added to the `PurchaseSummary` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `total_purchased` to the `PurchaseSummary` table without a default value. This is not possible if the table is not empty.
  - The required column `sales_summary_id` was added to the `SalesSummary` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `total_value` to the `SalesSummary` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExpenseByCategory" DROP CONSTRAINT "ExpenseByCategory_expenseSummaryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategories" DROP CONSTRAINT "ProductCategories_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Purchases" DROP CONSTRAINT "Purchases_productId_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_productId_fkey";

-- AlterTable
ALTER TABLE "ExpenseByCategory" DROP CONSTRAINT "ExpenseByCategory_pkey",
DROP COLUMN "expenseByCategoryId",
DROP COLUMN "expenseSummaryId",
ADD COLUMN     "expense_by_category_id" TEXT NOT NULL,
ADD COLUMN     "expense_summary_id" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "ExpenseByCategory_pkey" PRIMARY KEY ("expense_by_category_id");

-- AlterTable
ALTER TABLE "ExpenseSummary" DROP CONSTRAINT "ExpenseSummary_pkey",
DROP COLUMN "expenseSummaryId",
DROP COLUMN "totalExpenses",
ADD COLUMN     "expense_summary_id" TEXT NOT NULL,
ADD COLUMN     "total_expenses" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "ExpenseSummary_pkey" PRIMARY KEY ("expense_summary_id");

-- AlterTable
ALTER TABLE "PurchaseSummary" DROP CONSTRAINT "PurchaseSummary_pkey",
DROP COLUMN "changePercentage",
DROP COLUMN "purchaseSummaryId",
DROP COLUMN "totalPurchased",
ADD COLUMN     "change_percentage" DOUBLE PRECISION,
ADD COLUMN     "purchase_summary_id" TEXT NOT NULL,
ADD COLUMN     "total_purchased" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "PurchaseSummary_pkey" PRIMARY KEY ("purchase_summary_id");

-- AlterTable
ALTER TABLE "SalesSummary" DROP CONSTRAINT "SalesSummary_pkey",
DROP COLUMN "changePercentage",
DROP COLUMN "salesSummaryId",
DROP COLUMN "totalValue",
ADD COLUMN     "change_percentage" DOUBLE PRECISION,
ADD COLUMN     "sales_summary_id" TEXT NOT NULL,
ADD COLUMN     "total_value" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "SalesSummary_pkey" PRIMARY KEY ("sales_summary_id");

-- DropTable
DROP TABLE "Expenses";

-- DropTable
DROP TABLE "ProductCategories";

-- DropTable
DROP TABLE "Products";

-- DropTable
DROP TABLE "Purchases";

-- DropTable
DROP TABLE "Sales";

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Product" (
    "product_id" TEXT NOT NULL,
    "slug" TEXT,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "rating" DOUBLE PRECISION,
    "stock_quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "parent_id" TEXT,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "sale_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(65,30) NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("sale_id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "purchase_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DECIMAL(65,30) NOT NULL,
    "total_cost" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("purchase_id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "expense_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("expense_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "ProductCategory"("slug");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ProductCategory"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "ProductCategory"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseByCategory" ADD CONSTRAINT "ExpenseByCategory_expense_summary_id_fkey" FOREIGN KEY ("expense_summary_id") REFERENCES "ExpenseSummary"("expense_summary_id") ON DELETE RESTRICT ON UPDATE CASCADE;
