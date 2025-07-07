// client/src/app/types/productCategory.ts

import { ProductCategoryRelation } from "./product";

/**
 * ProductCategory type definition based on Prisma Schema
 */
export interface ProductCategory {
	id: number | null;
	name: string;
	slug: string;
	description?: string;
	createdAt: string;
	updatedAt: string;

	// SEO fields
	metaTitle?: string;
	metaDescription?: string;
	metaKeywords?: string;

	// Hierarchical structure
	parentId?: number | null;
	parent?: ProductCategory;
	children?: ProductCategory[];
	// Relations
	productCategories?: ProductCategoryRelation[];
}
