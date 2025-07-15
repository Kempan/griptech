import { Metadata } from "next";
import {
	getCategoryBySlug,
	getCategoryTopLevelBySlug,
	getCategories,
} from "@/app/actions/productCategoryActions";
import { getProductsByCategorySlug } from "@/app/actions/productActions";
import SidebarLayout from "@/app/[locale]/(components)/store/SidebarLayout";
import { SectionWrapper } from "@/app/[locale]/(components)/Wrappers";
import { ServerHeader } from "@/app/[locale]/(components)/Header/ServerHeader";
import ProductCard from "@/app/[locale]/(components)/ProductCard";
import { getTranslations } from "next-intl/server";

// Generate metadata for SEO
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const category = await getCategoryBySlug(slug);

	if (!category) {
		return {
			title: "Category Not Found",
		};
	}

	// Use SEO metadata fields if available, otherwise fall back to defaults
	const title = category.metaTitle || `${category.name} | Griptech`;
	const description =		
		category.metaDescription ||
		category.description ||
		`Shop our ${category.name} collection. Find the perfect prints and posters for your home or office.`;
	const keywords =
		category.metaKeywords || `${category.name}, prints, posters, wall art`;

	return {
		title,
		description,
		keywords,
		openGraph: {
			title: category.metaTitle || category.name,
			description:
				category.metaDescription ||
				category.description ||
				`Browse our ${category.name} collection.`,
			type: "website",
			url: `/product-category/${category.slug}`,
		},
	};
}

export default async function CategoryPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	// Await the params before using them
	const { slug } = await params;
	const t = await getTranslations();
	
	// Parallel data fetching for performance
	const [category, products, topLevelCategory, allCategories] = await Promise.all([
		getCategoryBySlug(slug),
		getProductsByCategorySlug(slug),
		getCategoryTopLevelBySlug(slug),
		getCategories(),
	]);

	return (
		<>
			<SidebarLayout
				categoryData={category}
				topLevelCategoryData={topLevelCategory}
				allCategories={allCategories}
			>
				<SectionWrapper className="py-4 px-4">
					<ServerHeader text={category?.name} />

					{/* Display category description if available */}
					{category?.description && (
						<div className="mb-6 prose prose-sm max-w-none text-gray-700">
							<p>{category.description}</p>
						</div>
					)}

					{/* Products grid with responsive layout */}
					{products && products.length > 0 ? (
						<div className="grid gap-5 justify-between grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
							{products.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					) : (
						<p className="text-center text-gray-600 py-8">
							{t("noProductsFoundInThisCategory")}
						</p>
					)}
				</SectionWrapper>
			</SidebarLayout>
		</>
	);
}
