// client/src/app/[locale]/(admin)/admin/product-categories/page.tsx
import { getCategories } from "@/app/actions/productCategoryActions";
import { ServerHeader } from "@/app/[locale]/(components)/Header/ServerHeader";
import CategoriesClient from "@/app/[locale]/(admin)/admin/product-categories/components/CategoriesClient";
import { ProductCategory } from "@/app/types";
import { getTranslations } from "next-intl/server";
// Flatten function (Keeps hierarchy structure)
function flattenCategories(
	categories: ProductCategory[],
	parentPrefix = ""
): ProductCategory[] {
	let flatList: ProductCategory[] = [];

	categories.forEach((category) => {
		const formattedName = parentPrefix
			? `${parentPrefix} → ${category.name}`
			: category.name;
		flatList.push({ ...category, name: formattedName });

		if (category.children && category.children.length > 0) {
			flatList = flatList.concat(
				flattenCategories(category.children, formattedName)
			);
		}
	});

	return flatList;
}

// Filter categories by search term
function filterCategories(
	categories: ProductCategory[],
	search: string
): ProductCategory[] {
	if (!search) return categories;

	const searchLower = search.toLowerCase();
	return categories.filter(
		(category) =>
			category.name.toLowerCase().includes(searchLower) ||
			category.slug.toLowerCase().includes(searchLower) ||
			String(category.id).includes(searchLower)
	);
}

// Fixed interface with Promise types
interface CategoriesPageProps {
	searchParams: Promise<{
		search?: string;
		page?: number;
	}>;
}

export default async function Categories({
	searchParams,
}: CategoriesPageProps) {
	// Await the searchParams Promise
	const { search, page } = await searchParams;
	const t = await getTranslations();
	// Extract search parameters
	const searchTerm = search || "";
	const currentPage = Number(page) || 1;
	const pageSize = 10;

	// Fetch all categories
	const categories = await getCategories();

	// Flatten categories for display
	const flattenedCategories = flattenCategories(categories);

	// Filter by search term
	const filteredCategories = filterCategories(flattenedCategories, searchTerm);

	// Calculate pagination
	const totalCount = filteredCategories.length;
	const startIndex = (currentPage - 1) * pageSize;
	const paginatedCategories = filteredCategories.slice(
		startIndex,
		startIndex + pageSize
	);

	// Create a category handler for new categories
	const handleCategoryCreated = (newCategory: ProductCategory) => {
		console.log(`✅ New category added: ${newCategory.name}`);
	};

	return (
		<div className="mx-auto pb-4 w-full">
			<ServerHeader text={t("categories")} />
			<CategoriesClient
				initialCategories={paginatedCategories}
				allCategories={flattenedCategories}
				totalCount={totalCount}
				currentPage={currentPage}
				pageSize={pageSize}
			/>
		</div>
	);
}
