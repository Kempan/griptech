import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import slugify from "slugify";

const prisma = new PrismaClient();
const saltRounds = 10;

// Function to fetch category ID by slug
async function getCategoryIdBySlug(slug: string): Promise<number | null> {
	const category = await prisma.productCategory.findUnique({
		where: { slug },
		select: { id: true },
	});
	return category ? category.id : null;
}

// Function to fetch product ID by slug
async function getProductIdBySlug(slug: string): Promise<number | null> {
	const product = await prisma.product.findUnique({
		where: { slug },
		select: { id: true },
	});
	return product ? product.id : null;
}

// Function to fetch expense summary ID by date (since there is no slug)
async function getExpenseSummaryIdByDate(date: string): Promise<number | null> {
	const summary = await prisma.expenseSummary.findFirst({
		where: { date: new Date(date) },
		select: { id: true },
	});
	return summary ? summary.id : null;
}

// Function to clear data in reverse order
async function deleteAllData(fileNames: string[]): Promise<void> {
	for (const fileName of fileNames) {
		const modelName = path.basename(fileName, path.extname(fileName));
		const model = prisma[modelName as keyof PrismaClient];
		if (model) {
			try {
				await prisma.$transaction([(model as any).deleteMany({})]);
				console.log(`Cleared data from ${modelName}`);
			} catch (error: any) {
				console.error(`Failed to clear ${modelName}: ${error.message}`);
			}
		}
	}
}

// Function to seed data
async function seedData(
	fileNames: string[],
	dataDirectory: string
): Promise<void> {
	for (const fileName of fileNames) {
		const filePath = path.join(dataDirectory, fileName);
		const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
		const modelName = path.basename(fileName, path.extname(fileName));
		const model = prisma[modelName as keyof PrismaClient];

		if (!model) {
			console.error(`No Prisma model matches ${fileName}`);
			continue;
		}

		for (const data of jsonData) {
			try {
				// Hash passwords for users
				if (modelName === "user") {
					data.password = await bcrypt.hash(
						data.password || "defaultpassword",
						saltRounds
					);
					data.roles = data.roles || [];
				}

				// Ensure slug is unique for new products and categories
				if (modelName === "product" || modelName === "productCategory") {
					if (!data.slug) {
						data.slug = slugify(data.name, { lower: true, strict: true });
					}
				}

				// Convert `parentId` from slug to integer before inserting product categories
				if (modelName === "productCategory" && data.parentId) {
					data.parentId = await getCategoryIdBySlug(data.parentId);
				}

				// Convert `categoryIds` from slugs to integers for products
				if (modelName === "product") {
					const { categoryIds, ...productData } = data;
					const createdProduct = await (model as any).create({
						data: productData,
					});

					if (categoryIds && categoryIds.length > 0) {
						for (const categorySlug of categoryIds) {
							const categoryId = await getCategoryIdBySlug(categorySlug);
							if (categoryId) {
								await prisma.productCategoryRelation.create({
									data: {
										productId: createdProduct.id,
										categoryId: categoryId,
									},
								});
							}
						}
					}
					continue;
				}

				// Convert `productId` from slug to integer in sales and purchases
				if (modelName === "sale" || modelName === "purchase") {
					data.productId = await getProductIdBySlug(data.productId);
				}

				// Convert `expenseSummaryId` from date to integer in `expenseByCategory`
				if (modelName === "expenseByCategory") {
					data.expenseSummaryId = await getExpenseSummaryIdByDate(data.date);
				}

				await (model as any).create({ data });
			} catch (error) {
				console.error(`Error seeding ${modelName}:`, error);
			}
		}
		console.log(`Seeded ${modelName} from ${fileName}`);
	}
}

// Main function
async function main() {
	const dataDirectory = path.join(__dirname, "seedData");
	const orderedFileNames = [
		"productCategory.json",
		"expenseSummary.json",
		"expenseByCategory.json",
		"product.json",
		"sale.json",
		"salesSummary.json",
		"purchase.json",
		"purchaseSummary.json",
		"user.json",
		"expense.json",
	];

	const reversedFileNames = [...orderedFileNames].reverse();

	console.log("🗑 Clearing data...");
	await deleteAllData(reversedFileNames);

	console.log("🌱 Seeding data...");
	await seedData(orderedFileNames, dataDirectory);
}

main()
	.catch((e) => console.error("❌ Error during seeding:", e))
	.finally(async () => await prisma.$disconnect());
