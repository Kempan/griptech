import { Product } from "@/app/types/product";

/**
 * Check if a product is out of stock based on stock management settings
 */
export function isOutOfStock(product: Product): boolean {
	// If stock management is disabled, product is always in stock
	if (!product.enableStockManagement) {
		return false;
	}
	
	// If stock management is enabled, check if stock quantity is 0 or less
	return product.stockQuantity <= 0;
}

/**
 * Check if a product has low stock (5 or fewer items)
 */
export function hasLowStock(product: Product): boolean {
	// If stock management is disabled, never show low stock
	if (!product.enableStockManagement) {
		return false;
	}
	
	return product.stockQuantity > 0 && product.stockQuantity <= 5;
}

/**
 * Get the maximum quantity that can be added to cart
 */
export function getMaxQuantity(product: Product, defaultMax: number = 10): number {
	// If stock management is disabled, use default max
	if (!product.enableStockManagement) {
		return defaultMax;
	}
	
	// If stock management is enabled, use stock quantity or default max, whichever is smaller
	return Math.min(product.stockQuantity, defaultMax);
}

/**
 * Get stock status text
 */
export function getStockStatusText(product: Product): string {
	if (!product.enableStockManagement) {
		return "In Stock";
	}
	
	if (product.stockQuantity <= 0) {
		return "Out of Stock";
	}
	
	if (product.stockQuantity <= 5) {
		return "Low Stock";
	}
	
	return "In Stock";
}

/**
 * Get stock status color class
 */
export function getStockStatusColor(product: Product): string {
	if (!product.enableStockManagement) {
		return "text-green-600";
	}
	
	if (product.stockQuantity <= 0) {
		return "text-red-600";
	}
	
	if (product.stockQuantity <= 5) {
		return "text-orange-600";
	}
	
	return "text-green-600";
}

/**
 * Get stock display text for UI
 */
export function getStockDisplayText(product: Product): string {
	if (!product.enableStockManagement) {
		return "Stock management disabled";
	}
	
	if (product.stockQuantity <= 0) {
		return "Out of Stock";
	}
	
	return `${product.stockQuantity} in stock`;
} 