// server/src/controllers/public/bundleController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { decrypt } from "../../lib/session";

const prisma = new PrismaClient();

// Define types
interface SessionPayload {
	userId: string | number;
	roles?: string[];
	expiresAt?: Date | string;
}

interface BundleItem {
	productId: number;
	quantity: number;
	order: number;
}

/**
 * Get all bundles for the current user
 */
export const getUserBundles = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const sessionCookie = req.cookies.session;
		if (!sessionCookie) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const session = (await decrypt(sessionCookie)) as SessionPayload | null;
		if (!session || !session.userId) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const userId = parseInt(session.userId.toString());

		// Get pagination parameters
		const page = parseInt(req.query.page as string) || 1;
		const pageSize = parseInt(req.query.pageSize as string) || 10;

		// Get total count
		const totalCount = await prisma.productBundle.count({
			where: { userId, isActive: true },
		});

		// Get bundles
		const bundles = await prisma.productBundle.findMany({
			where: { userId, isActive: true },
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
		});

		// Extract all product IDs from all bundles
		const allProductIds = new Set<number>();
		bundles.forEach((bundle) => {
			const items = bundle.items as unknown as BundleItem[];
			items.forEach((item) => allProductIds.add(item.productId));
		});

		// Fetch all products in one query
		const products = await prisma.product.findMany({
			where: {
				id: { in: Array.from(allProductIds) },
			},
			include: {
				productCategories: {
					include: { category: true },
				},
			},
		});

		// Create a map for quick product lookup
		const productMap = new Map(products.map((p) => [p.id, p]));

		// Format bundles with products
		const formattedBundles = bundles.map((bundle) => {
			const items = (bundle.items as unknown as BundleItem[])
				.sort((a, b) => a.order - b.order)
				.map((item) => {
					const product = productMap.get(item.productId);
					return product
						? {
								...item,
								product: {
									...product,
									price: Number(product.price),
									categories: product.productCategories.map((rel) => ({
										id: rel.category.id,
										name: rel.category.name,
										slug: rel.category.slug,
									})),
								},
						  }
						: null;
				})
				.filter(Boolean); // Remove any null items (deleted products)

			return {
				...bundle,
				items,
			};
		});

		res.json({
			bundles: formattedBundles,
			totalCount,
			pageCount: Math.ceil(totalCount / pageSize),
			currentPage: page,
		});
	} catch (error) {
		console.error("Error retrieving bundles:", error);
		res.status(500).json({ message: "Error retrieving bundles" });
	}
};

/**
 * Get a single bundle by ID
 */
export const getBundleById = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const sessionCookie = req.cookies.session;
		if (!sessionCookie) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const session = (await decrypt(sessionCookie)) as SessionPayload | null;
		if (!session || !session.userId) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const userId = parseInt(session.userId.toString());
		const bundleId = parseInt(req.params.id);

		// Get bundle
		const bundle = await prisma.productBundle.findFirst({
			where: { id: bundleId, userId, isActive: true },
		});

		if (!bundle) {
			res.status(404).json({ message: "Bundle not found" });
			return;
		}

		// Get product IDs from bundle
		const items = bundle.items as unknown as BundleItem[];
		const productIds = items.map((item) => item.productId);

		// Fetch all products
		const products = await prisma.product.findMany({
			where: {
				id: { in: productIds },
			},
			include: {
				productCategories: {
					include: { category: true },
				},
			},
		});

		// Create product map
		const productMap = new Map(products.map((p) => [p.id, p]));

		// Format bundle with products
		const formattedBundle = {
			...bundle,
			items: items
				.sort((a, b) => a.order - b.order)
				.map((item) => {
					const product = productMap.get(item.productId);
					return product
						? {
								...item,
								product: {
									...product,
									price: Number(product.price),
									categories: product.productCategories.map((rel) => ({
										id: rel.category.id,
										name: rel.category.name,
										slug: rel.category.slug,
									})),
								},
						  }
						: null;
				})
				.filter(Boolean),
		};

		res.json(formattedBundle);
	} catch (error) {
		console.error("Error retrieving bundle:", error);
		res.status(500).json({ message: "Error retrieving bundle" });
	}
};

/**
 * Create a new product bundle
 */
export const createBundle = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const sessionCookie = req.cookies.session;
		if (!sessionCookie) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const session = (await decrypt(sessionCookie)) as SessionPayload | null;
		if (!session || !session.userId) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const userId = parseInt(session.userId.toString());
		const { name, description } = req.body;

		// Validate input
		if (!name || name.trim() === "") {
			res.status(400).json({ message: "Bundle name is required" });
			return;
		}

		// Create bundle with empty items array
		const bundle = await prisma.productBundle.create({
			data: {
				userId,
				name: name.trim(),
				description: description?.trim(),
				items: [],
			},
		});

		res.status(201).json({
			message: "Bundle created successfully",
			bundle,
		});
	} catch (error) {
		console.error("Error creating bundle:", error);
		res.status(500).json({ message: "Error creating bundle" });
	}
};

/**
 * Update a bundle (name, description)
 */
export const updateBundle = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const sessionCookie = req.cookies.session;
		if (!sessionCookie) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const session = (await decrypt(sessionCookie)) as SessionPayload | null;
		if (!session || !session.userId) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const userId = parseInt(session.userId.toString());
		const bundleId = parseInt(req.params.id);
		const { name, description } = req.body;

		// Check if bundle exists and belongs to user
		const bundle = await prisma.productBundle.findFirst({
			where: { id: bundleId, userId, isActive: true },
		});

		if (!bundle) {
			res.status(404).json({ message: "Bundle not found" });
			return;
		}

		// Update bundle
		const updatedBundle = await prisma.productBundle.update({
			where: { id: bundleId },
			data: {
				name: name?.trim(),
				description: description?.trim(),
			},
		});

		res.json({
			message: "Bundle updated successfully",
			bundle: updatedBundle,
		});
	} catch (error) {
		console.error("Error updating bundle:", error);
		res.status(500).json({ message: "Error updating bundle" });
	}
};

/**
 * Update bundle items (add, remove, update quantity, reorder)
 */
export const updateBundleItems = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const sessionCookie = req.cookies.session;
		if (!sessionCookie) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const session = (await decrypt(sessionCookie)) as SessionPayload | null;
		if (!session || !session.userId) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const userId = parseInt(session.userId.toString());
		const bundleId = parseInt(req.params.id);
		const { items } = req.body;

		// Validate input
		if (!Array.isArray(items)) {
			res.status(400).json({ message: "Items must be an array" });
			return;
		}

		// Check if bundle exists and belongs to user
		const bundle = await prisma.productBundle.findFirst({
			where: { id: bundleId, userId, isActive: true },
		});

		if (!bundle) {
			res.status(404).json({ message: "Bundle not found" });
			return;
		}

		// Validate and format items
		const formattedItems: BundleItem[] = items.map((item, index) => ({
			productId: parseInt(item.productId),
			quantity: parseInt(item.quantity) || 1,
			order: item.order !== undefined ? parseInt(item.order) : index,
		}));

		// Update bundle items
		const updatedBundle = await prisma.productBundle.update({
			where: { id: bundleId },
			data: { items: JSON.parse(JSON.stringify(formattedItems)) },
		});

		res.json({
			message: "Bundle items updated successfully",
			bundle: updatedBundle,
		});
	} catch (error) {
		console.error("Error updating bundle items:", error);
		res.status(500).json({ message: "Error updating bundle items" });
	}
};

/**
 * Add a single product to bundle
 */
export const addProductToBundle = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const sessionCookie = req.cookies.session;
		if (!sessionCookie) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const session = (await decrypt(sessionCookie)) as SessionPayload | null;
		if (!session || !session.userId) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const userId = parseInt(session.userId.toString());
		const bundleId = parseInt(req.params.id);
		const { productId, quantity = 1 } = req.body;

		// Validate input
		if (!productId) {
			res.status(400).json({ message: "Product ID is required" });
			return;
		}

		// Check if bundle exists and belongs to user
		const bundle = await prisma.productBundle.findFirst({
			where: { id: bundleId, userId, isActive: true },
		});

		if (!bundle) {
			res.status(404).json({ message: "Bundle not found" });
			return;
		}

		// Check if product exists
		const product = await prisma.product.findUnique({
			where: { id: parseInt(productId.toString()) },
		});

		if (!product) {
			res.status(404).json({ message: "Product not found" });
			return;
		}

		// Get current items
		const currentItems = bundle.items as unknown as BundleItem[];

		// Check if product already exists
		const existingItemIndex = currentItems.findIndex(
			(item) => item.productId === parseInt(productId.toString())
		);

		if (existingItemIndex !== -1) {
			// Update quantity
			currentItems[existingItemIndex].quantity += quantity;
		} else {
			// Add new item
			const maxOrder = currentItems.reduce(
				(max, item) => (item.order > max ? item.order : max),
				-1
			);

			currentItems.push({
				productId: parseInt(productId.toString()),
				quantity,
				order: maxOrder + 1,
			});
		}

		// Update bundle
		const updatedBundle = await prisma.productBundle.update({
			where: { id: bundleId },
			data: { items: JSON.parse(JSON.stringify(currentItems)) },
		});

		res.json({
			message: "Product added to bundle successfully",
			bundle: updatedBundle,
		});
	} catch (error) {
		console.error("Error adding product to bundle:", error);
		res.status(500).json({ message: "Error adding product to bundle" });
	}
};

/**
 * Remove a product from bundle
 */
export const removeProductFromBundle = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const sessionCookie = req.cookies.session;
		if (!sessionCookie) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const session = (await decrypt(sessionCookie)) as SessionPayload | null;
		if (!session || !session.userId) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const userId = parseInt(session.userId.toString());
		const bundleId = parseInt(req.params.id);
		const productId = parseInt(req.params.productId);

		// Check if bundle exists and belongs to user
		const bundle = await prisma.productBundle.findFirst({
			where: { id: bundleId, userId, isActive: true },
		});

		if (!bundle) {
			res.status(404).json({ message: "Bundle not found" });
			return;
		}

		// Get current items and filter out the product
		const currentItems = bundle.items as unknown as BundleItem[];
		const updatedItems = currentItems.filter(
			(item) => item.productId !== productId
		);

		// Update bundle
		const updatedBundle = await prisma.productBundle.update({
			where: { id: bundleId },
			data: { items: JSON.parse(JSON.stringify(updatedItems)) },
		});

		res.json({
			message: "Product removed from bundle successfully",
			bundle: updatedBundle,
		});
	} catch (error) {
		console.error("Error removing product from bundle:", error);
		res.status(500).json({ message: "Error removing product from bundle" });
	}
};

/**
 * Delete a bundle (soft delete)
 */
export const deleteBundle = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const sessionCookie = req.cookies.session;
		if (!sessionCookie) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const session = (await decrypt(sessionCookie)) as SessionPayload | null;
		if (!session || !session.userId) {
			res.status(401).json({ message: "Not authenticated" });
			return;
		}

		const userId = parseInt(session.userId.toString());
		const bundleId = parseInt(req.params.id);

		// Check if bundle exists and belongs to user
		const bundle = await prisma.productBundle.findFirst({
			where: { id: bundleId, userId },
		});

		if (!bundle) {
			res.status(404).json({ message: "Bundle not found" });
			return;
		}

		// Soft delete by marking as inactive
		await prisma.productBundle.update({
			where: { id: bundleId },
			data: { isActive: false },
		});

		res.json({ message: "Bundle deleted successfully" });
	} catch (error) {
		console.error("Error deleting bundle:", error);
		res.status(500).json({ message: "Error deleting bundle" });
	}
};
