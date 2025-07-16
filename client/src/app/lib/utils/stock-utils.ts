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
export function getStockStatusText(product: Product, t: (key: string) => string): string {
	if (!product.enableStockManagement) {
		return t("InStock");
	}
	
	if (product.stockQuantity <= 0) {
		return t("OutOfStock");
	}
	
	if (product.stockQuantity <= 5) {
		return t("LowStock");
	}
	
	return t("InStock");
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
export function getStockDisplayText(product: Product, t: (key: string) => string): string {
	if (!product.enableStockManagement) {
		return t("StockManagementDisabled");
	}
	
	if (product.stockQuantity <= 0) {
		return t("OutOfStock");
	}
	
	return `${product.stockQuantity} ${t("InStock")}`;
} 