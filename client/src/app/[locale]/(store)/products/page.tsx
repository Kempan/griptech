// src/app/[locale]/(store)/products/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@/app/actions/productActions";
import { getCategories } from "@/app/actions/productCategoryActions";
import SidebarLayout from "@/app/[locale]/(components)/store/SidebarLayout";
import { SectionWrapper } from "@/app/[locale]/(components)/Wrappers";
import { ServerHeader } from "@/app/[locale]/(components)/Header/ServerHeader";
import ProductCard from "@/app/[locale]/(components)/ProductCard";
import { getTranslations } from "next-intl/server";
import { Product, ProductCategory } from "@/app/types";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/shadcn/components/ui/pagination";

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations();

	return {
		title: `${t("AllProducts")} | Griptech`,
		description: t("AllProducts"),
		keywords: "prints, posters, wall art, home decor, artwork, all products",
		openGraph: {
			title: t("AllProducts"),
			type: "website",
			url: "/products",
		},
	};
}

interface ProductsPageProps {
	searchParams: Promise<{
		page?: string;
		search?: string;
		sort?: string;
	}>;
}

export default async function ProductsPage({
	searchParams,
}: ProductsPageProps) {
	const t = await getTranslations();
	const params = await searchParams;

	// Pagination setup
	const currentPage = Number(params.page) || 1;
	const pageSize = 2;
	const searchTerm = params.search || "";
	const sortBy = params.sort || "name";

	// Create a virtual category object for the "All Products" page
	const allProductsCategory: ProductCategory = {
		id: 0,
		name: t("AllProducts"),
		slug: "products",
		parentId: null,
		children: [],
		description: "",
		metaTitle: "",
		metaDescription: "",
		metaKeywords: "",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	try {
		// Parallel data fetching for performance
		const [products, categories] = await Promise.all([
			getProducts({ limit: 999 }), // Get all products for now
			getCategories(),
		]);

		// Apply search filter if provided
		let filteredProducts = products || [];
		if (searchTerm) {
			filteredProducts = filteredProducts.filter((product: Product) =>
				product.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Apply sorting
		const sortedProducts = [...filteredProducts].sort((a, b) => {
			switch (sortBy) {
				case "price-asc":
					return a.price - b.price;
				case "price-desc":
					return b.price - a.price;
				case "name-desc":
					return b.name.localeCompare(a.name);
				case "name":
				case "name-asc":
				default:
					return a.name.localeCompare(b.name);
			}
		});

		// Calculate pagination
		const totalProducts = sortedProducts.length;
		const totalPages = Math.ceil(totalProducts / pageSize);
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

		// Get the first top-level category for sidebar context
		const topLevelCategoryData =
			categories && categories.length > 0 ? categories[0] : null;

		return (
			<SidebarLayout
				categoryData={allProductsCategory}
				topLevelCategoryData={null}
				allCategories={categories}
			>
				<SectionWrapper className="p-3 md:p-6">
					<ServerHeader text={t("AllProducts")} />

					{/* Display description if needed */}
					<div className="mb-6 text-gray-700">
						<div className="flex justify-between items-center mt-4">
							<p className="text-sm text-gray-600">
								{totalProducts > 0
									? t("ShowingXOfY", {
											start: startIndex + 1,
											end: Math.min(endIndex, totalProducts),
											total: totalProducts,
									  })
									: t("NoProductsFound")}
							</p>
						</div>
					</div>

					<Suspense fallback={<ProductsGridSkeleton />}>
						{paginatedProducts.length > 0 ? (
							<>
								{/* Products grid with responsive layout */}
								<div className="grid gap-5 justify-between grid-cols-[repeat(auto-fill,minmax(200px,1fr))] mb-8">
									{paginatedProducts.map((product: Product) => (
										<ProductCard key={product.id} product={product} />
									))}
								</div>

								{/* Pagination */}
								{totalPages > 1 && (
									<div className="flex justify-center mt-8">
										<Pagination>
											<PaginationContent>
												<PaginationItem>
													<PaginationPrevious
														href={buildPaginationUrl(
															Math.max(1, currentPage - 1),
															searchTerm,
															sortBy
														)}
														className={
															currentPage === 1
																? "pointer-events-none opacity-50"
																: ""
														}
													/>
												</PaginationItem>

												{/* Page numbers */}
												{generatePaginationItems(currentPage, totalPages).map(
													(item, index) => (
														<PaginationItem key={index}>
															{item === "..." ? (
																<PaginationEllipsis />
															) : (
																<PaginationLink
																	href={buildPaginationUrl(
																		item as number,
																		searchTerm,
																		sortBy
																	)}
																	isActive={currentPage === item}
																>
																	{item}
																</PaginationLink>
															)}
														</PaginationItem>
													)
												)}

												<PaginationItem>
													<PaginationNext
														href={buildPaginationUrl(
															Math.min(totalPages, currentPage + 1),
															searchTerm,
															sortBy
														)}
														className={
															currentPage === totalPages
																? "pointer-events-none opacity-50"
																: ""
														}
													/>
												</PaginationItem>
											</PaginationContent>
										</Pagination>
									</div>
								)}
							</>
						) : (
							<p className="text-center text-gray-600 py-8">
								{searchTerm
									? t("NoProductsFoundForSearch", { search: searchTerm })
									: t("NoProductsFound")}
							</p>
						)}
					</Suspense>
				</SectionWrapper>
			</SidebarLayout>
		);
	} catch (error) {
		console.error("Error loading products page:", error);

		// Fallback error handling
		return (
			<SectionWrapper className="p-3 md:p-6">
				<ServerHeader text={t("AllProducts")} />
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<div className="bg-red-50 p-6 rounded-lg max-w-md w-full">
						<h2 className="text-xl font-semibold text-red-700 mb-3">
							{t("ErrorLoadingProducts")}
						</h2>
						<p className="text-gray-700">
							{t("ErrorLoadingProductsDescription")}
						</p>
					</div>
				</div>
			</SectionWrapper>
		);
	}
}

// Helper function to build pagination URLs
function buildPaginationUrl(
	page: number,
	search: string,
	sort: string
): string {
	const params = new URLSearchParams();
	params.set("page", page.toString());
	if (search) params.set("search", search);
	if (sort && sort !== "name") params.set("sort", sort);
	return `?${params.toString()}`;
}

// Helper function to generate pagination items
function generatePaginationItems(
	currentPage: number,
	totalPages: number
): (number | string)[] {
	const items: (number | string)[] = [];
	const maxVisible = 5;

	if (totalPages <= maxVisible + 2) {
		// Show all pages if total is small
		for (let i = 1; i <= totalPages; i++) {
			items.push(i);
		}
	} else {
		// Always show first page
		items.push(1);

		if (currentPage > 3) {
			items.push("...");
		}

		// Show pages around current page
		const start = Math.max(2, currentPage - 1);
		const end = Math.min(totalPages - 1, currentPage + 1);

		for (let i = start; i <= end; i++) {
			items.push(i);
		}

		if (currentPage < totalPages - 2) {
			items.push("...");
		}

		// Always show last page
		items.push(totalPages);
	}

	return items;
}

// Skeleton loader for the products grid - showing 24 items
function ProductsGridSkeleton() {
	return (
		<div className="grid gap-5 justify-between grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
			{Array.from({ length: 24 }).map((_, index) => (
				<div key={index} className="flex flex-col gap-2">
					<div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
					<div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
					<div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
				</div>
			))}
		</div>
	);
}
