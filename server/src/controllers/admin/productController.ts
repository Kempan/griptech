import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAdminProducts = async (req: Request, res: Response) => {
	try {
		const search = req.query.search as string | undefined;
		const page = parseInt(req.query.page as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 5;
		const sortBy = (req.query.sortBy as string) || "name";
		const sortOrder = (req.query.sortOrder as "asc" | "desc") || "asc";
		// console.log({ search, page, pageSize, sortBy, sortOrder });

		// ✅ Ensure page & pageSize are positive numbers
		const pageNumber = Math.max(1, page);
		const perPage = Math.max(1, pageSize);
		const validSortBy = [
			"id",
			"name",
			"price",
			"stockQuantity",
			"createdAt",
		].includes(sortBy)
			? sortBy
			: "name";

		const totalCount = await prisma.product.count({
			where: search ? { name: { contains: search, mode: "insensitive" } } : {},
		});

		const products = await prisma.product.findMany({
			where: search ? { name: { contains: search, mode: "insensitive" } } : {},
			orderBy: {
				[validSortBy]: sortOrder,
			},
			skip: (pageNumber - 1) * perPage,
			take: perPage,
			include: {
				productCategories: {
					include: { category: true },
				},
			},
		});

		const formattedProducts = products.map(
			({ productCategories, ...product }) => ({
				...product,
				price: Number(product.price),
				createdAt: product.createdAt.toISOString(),
				updatedAt: product.updatedAt.toISOString(),
				categories: productCategories.map((rel) => ({
					id: rel.category.id,
					name: rel.category.name,
					slug: rel.category.slug,
				})),
			})
		);

		res.json({ products: formattedProducts, totalCount });
	} catch (error) {
		console.error("❌ Error fetching admin products:", error);
		res.status(500).json({ message: "Error retrieving admin products" });
	}
};

export const createProduct = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { slug, name, price, rating, stockQuantity } = req.body;
		const product = await prisma.product.create({
			data: {
				slug,
				name,
				price,
				rating,
				stockQuantity,
			},
		});
		res.status(201).json(product);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error creating product" });
	}
};

export const updateProductCategories = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const { categoryIds } = req.body;

		// Validate input
		if (!Array.isArray(categoryIds)) {
			res.status(400).json({ message: "categoryIds must be an array" });
			return;
		}

		// Check if product exists
		const product = await prisma.product.findUnique({
			where: { id: Number(id) },
		});
		if (!product) {
			res.status(404).json({ message: "Product not found" });
			return;
		}

		// ✅ Step 1: Remove all existing category relations for this product
		await prisma.productCategoryRelation.deleteMany({
			where: { productId: Number(id) },
		});

		// ✅ Step 2: Insert new category relations
		if (categoryIds.length > 0) {
			await prisma.productCategoryRelation.createMany({
				data: categoryIds.map((categoryId: number) => ({
					productId: Number(id),
					categoryId,
				})),
			});
		}

		res.json({ message: "Product categories updated successfully" });
	} catch (error) {
		console.error("Error updating product categories:", error);
		res.status(500).json({ message: "Error updating categories" });
	}
};

export const updateProduct = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const {
			name,
			slug,
			price,
			stockQuantity,
			categoryIds,
			// SEO fields
			description,
			shortDescription,
			metaTitle,
			metaDescription,
			metaKeywords,
		} = req.body;

		// Check if product exists
		const product = await prisma.product.findUnique({
			where: { id: Number(id) },
		});
		if (!product) {
			res.status(404).json({ message: "Product not found" });
			return;
		}

		// Transaction to update product and categories atomically
		await prisma.$transaction(async (tx) => {
			// Update product details
			await tx.product.update({
				where: { id: Number(id) },
				data: {
					...(name !== undefined && { name }),
					...(slug !== undefined && { slug }),
					...(price !== undefined && { price }),
					...(stockQuantity !== undefined && { stockQuantity }),
					// Add SEO fields to update
					...(description !== undefined && { description }),
					...(shortDescription !== undefined && { shortDescription }),
					...(metaTitle !== undefined && { metaTitle }),
					...(metaDescription !== undefined && { metaDescription }),
					...(metaKeywords !== undefined && { metaKeywords }),
				},
			});

			// Update categories if provided
			if (Array.isArray(categoryIds)) {
				// Remove existing category relations
				await tx.productCategoryRelation.deleteMany({
					where: { productId: Number(id) },
				});

				// Insert new category relations
				if (categoryIds.length > 0) {
					await tx.productCategoryRelation.createMany({
						data: categoryIds.map((categoryId) => ({
							productId: Number(id),
							categoryId: Number(categoryId),
						})),
					});
				}
			}
		});

		res.json({ message: "Product updated successfully" });
	} catch (error) {
		console.error("Error updating product:", error);
		res.status(500).json({ message: "Error updating product" });
	}
};

export const deleteProduct = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const productId = Number(id);

		// Check if product exists
		const product = await prisma.product.findUnique({
			where: { id: productId },
		});

		if (!product) {
			res.status(404).json({ message: "Product not found" });
			return;
		}

		// Transaction to delete product and related data atomically
		await prisma.$transaction(async (tx) => {
			// First, delete all category relations for this product
			await tx.productCategoryRelation.deleteMany({
				where: { productId },
			});

			// Then delete the product itself
			await tx.product.delete({
				where: { id: productId },
			});
		});

		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.error("Error deleting product:", error);
		res.status(500).json({ message: "Error deleting product" });
	}
};
