import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateUniqueProductSlug } from "../../lib/slugify";
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
		const { 
			slug, 
			name, 
			price, 
			rating, 
			stockQuantity, 
			enableStockManagement,
			description,
			shortDescription,
			metaTitle,
			metaDescription,
			metaKeywords,
			categoryIds 
		} = req.body;

		// Validate required fields
		if (!name) {
			res.status(400).json({ message: "Product name is required" });
			return;
		}

		// Generate unique slug (using provided slug or generating from name)
		const uniqueSlug = await generateUniqueProductSlug(prisma, name, slug);

		// Use transaction to create product and categories atomically
		const result = await prisma.$transaction(async (tx) => {
			// Create the product
			const product = await tx.product.create({
				data: {
					slug: uniqueSlug,
					name,
					price: price || 0,
					rating: rating || 0,
					stockQuantity: enableStockManagement ? (stockQuantity || 0) : null,
					description: description || null,
					shortDescription: shortDescription || null,
					metaTitle: metaTitle || null,
					metaDescription: metaDescription || null,
					metaKeywords: metaKeywords || null,
				},
			});

			// Create category relations if categoryIds are provided
			if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
				await tx.productCategoryRelation.createMany({
					data: categoryIds.map((categoryId: number) => ({
						productId: product.id,
						categoryId,
					})),
				});
			}

			return product;
		});

		// Fetch the created product with categories
		const productWithCategories = await prisma.product.findUnique({
			where: { id: result.id },
			include: {
				productCategories: {
					include: { category: true },
				},
			},
		});

		// Convert decimal to number for response
		const formattedProduct = {
			...productWithCategories,
			price: Number(productWithCategories?.price),
			createdAt: productWithCategories?.createdAt.toISOString(),
			updatedAt: productWithCategories?.updatedAt.toISOString(),
			categories: productWithCategories?.productCategories.map((rel) => ({
				id: rel.category.id,
				name: rel.category.name,
				slug: rel.category.slug,
			})),
		};

		res.status(201).json(formattedProduct);
	} catch (error) {
		console.error("Error creating product:", error);
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
			enableStockManagement,
			rating,
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

		// Only regenerate slug if:
		// 1. A new slug is explicitly provided, OR
		// 2. The name has changed and no slug was provided
		let finalSlug = product.slug;
		if (slug !== undefined) {
			// User provided a slug (even if empty), generate unique slug
			finalSlug = await generateUniqueProductSlug(
				prisma,
				name || product.name,
				slug
			);
		} else if (name && name !== product.name) {
			// Name changed but no slug provided, keep existing slug
			// You could change this behavior if you want to regenerate on name change
			finalSlug = product.slug;
		}

		// Transaction to update product and categories atomically
		await prisma.$transaction(async (tx) => {
			// Update product details
			await tx.product.update({
				where: { id: Number(id) },
				data: {
					...(name !== undefined && { name }),
					slug: finalSlug,
					...(price !== undefined && { price }),
					...(enableStockManagement !== undefined && { enableStockManagement }),
					...(stockQuantity !== undefined && { 
						stockQuantity: enableStockManagement ? stockQuantity : null 
					}),
					...(rating !== undefined && { rating }),
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
