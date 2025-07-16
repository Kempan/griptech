// client/src/app/types/product.ts

import { ProductCategory } from "./productCategory";

// Product creation payload
export interface NewProduct {
	name: string;
	slug: string;
	price: number;
	stockQuantity: number;
	rating?: number;
	enableStockManagement: boolean;
	description?: string;
	shortDescription?: string;
	metaTitle?: string;
	metaDescription?: string;
	metaKeywords?: string;
	categoryIds: number[];
}

/**
 * Product type definition based on Prisma Schema
 */
export interface Product {
	id: number;
	slug: string;
	name: string;
	price: number;
	rating?: number;
	stockQuantity: number;
	enableStockManagement: boolean;
	createdAt: string;
	updatedAt: string;

	// SEO fields
	description?: string | null;
	shortDescription?: string | null;
	metaTitle?: string | null;
	metaDescription?: string | null;
	metaKeywords?: string | null;

	// Relations
	categories?: ProductCategory[];
	productCategories?: ProductCategoryRelation[];
}

// Product update payload
export interface UpdateProductPayload {
	id: number;
	data: {
		name?: string;
		slug?: string;
		price?: number;
		stockQuantity?: number;
		enableStockManagement?: boolean;
		rating?: number;
		categoryIds?: number[];
		description?: string;
		shortDescription?: string;
		metaTitle?: string;
		metaDescription?: string;
		metaKeywords?: string;
	};
}

/**
 * ProductCategoryRelation type for join table
 */
export interface ProductCategoryRelation {
	productId: number;
	categoryId: number;
	product?: Product;
	category?: ProductCategory;
}

/**
 * CreateProductFormData type
 */
export interface CreateProductFormData {
	name: string;
	slug: string;
	price: number;
	stockQuantity: number;
	rating: number;
	enableStockManagement: boolean;
	description?: string;
	shortDescription?: string;
	metaTitle?: string;
	metaDescription?: string;
	metaKeywords?: string;
	categoryIds: number[];
}

// Category creation payload
export interface NewCategory {
	name: string;
	slug: string;
	parentId?: number | null;
}

/**
 * Sale model type
 */
export interface Sale {
	id: number;
	productId: number;
	timestamp: string;
	quantity: number;
	unitPrice: number;
	totalAmount: number;
	product?: Product;
}

/**
 * Purchase model type
 */
export interface Purchase {
	id: number;
	productId: number;
	timestamp: string;
	quantity: number;
	unitCost: number;
	totalCost: number;
	product?: Product;
}
