import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProductById = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		const product = await prisma.product.findUnique({
			where: { id: Number(id) },
			include: {
				productCategories: {
					include: { category: true }, // ✅ Fetch multiple categories
				},
			},
		});

		if (!product) {
			res.status(404).json({ message: "Product not found" });
			return;
		}

		// ✅ Transform data for better readability
		const formattedProduct = {
			...product,
			categories: product.productCategories.map((rel) => rel.category), // Extract category details
		};

		res.json(formattedProduct);
	} catch (error) {
		console.error("Error fetching product:", error);
		res.status(500).json({ message: "Error retrieving product details" });
	}
};

export const getProducts = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const search = req.query.search?.toString();
		const limit = parseInt(req.query.limit as string) || 999;
		console.log("getProducts", limit);

		const products = await prisma.product.findMany({
			where: search
				? {
						name: {
							contains: search,
							mode: "insensitive",
						},
				  }
				: undefined,
			take: limit,
			include: {
				productCategories: {
					include: { category: true },
				},
			},
		});

		// ✅ Remove `productCategories` & attach `categories` directly
		const formattedProducts = products.map(
			({ productCategories, ...product }) => ({
				...product,
				price: Number(product.price), // Convert Prisma Decimal to Number
				createdAt: product.createdAt.toISOString(),
				updatedAt: product.updatedAt.toISOString(),
				categories: productCategories.map((rel) => ({
					id: rel.category.id,
					name: rel.category.name,
					slug: rel.category.slug,
				})), // ✅ Keep only relevant category fields
			})
		);

		res.json(formattedProducts);
	} catch (error) {
		console.error("Error retrieving products:", error);
		res.status(500).json({ message: "Error retrieving products" });
	}
};

export const getProductBySlug = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { slug } = req.params;
	
	try {
		const product = await prisma.product.findUnique({
			where: { slug },
			include: {
				productCategories: {
					include: { category: true }, // ✅ Fetch multiple categories
				},
			},
		});

		if (!product) {
			res.status(404).json({ message: "Product not found" });
			return;
		}

		// ✅ Transform data to include category details
		const formattedProduct = {
			...product,
			categories: product.productCategories.map((rel) => rel.category),
		};

		res.json(formattedProduct);
	} catch (error) {
		console.error("Error retrieving product by slug:", error);
		res.status(500).json({ message: "Error retrieving product by slug" });
	}
};

export const getProductsByCategorySlug = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const { slug } = req.params;

		if (!slug) {
			res.status(400).json({ message: "Category slug is required" });
			return;
		}

		// ✅ Find category by slug
		const category = await prisma.productCategory.findUnique({
			where: { slug: slug as string },
		});

		if (!category) {
			res.status(404).json({ message: "Category not found" });
			return;
		}

		// ✅ Fetch products linked to this category
		const products = await prisma.product.findMany({
			where: {
				productCategories: {
					some: {
						categoryId: category.id, // ✅ Find products in this category
					},
				},
			},
			include: {
				productCategories: {
					include: { category: true }, // ✅ Fetch category details
				},
			},
		});

		// ✅ Transform data to only include `categories`
		const formattedProducts = products.map(
			({ productCategories, ...product }) => ({
				...product,
				categories: productCategories.map((rel) => rel.category), // ✅ Only return categories
			})
		);

		res.json(formattedProducts);
	} catch (error) {
		console.error("Error retrieving products by category slug:", error);
		res
			.status(500)
			.json({ message: "Error retrieving products by category slug" });
	}
};
