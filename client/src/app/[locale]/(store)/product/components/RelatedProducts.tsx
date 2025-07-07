// client/src/app/[locale]/(store)/product/components/RelatedProducts.tsx

import { getProductsByCategorySlug } from "@/app/actions/productActions";
import Carousel from "@/app/[locale]/(components)/store/Carousel";
import ProductCard from "@/app/[locale]/(components)/ProductCard";
import { ServerHeader } from "@/app/[locale]/(components)/Header/ServerHeader";
import { getTranslations } from "next-intl/server";

interface RelatedProductsProps {
	categorySlug?: string;
	currentProductId?: number;
	limit?: number;
}

const RelatedProducts = async ({
	categorySlug,
	currentProductId,
	limit = 6,
}: RelatedProductsProps) => {
	if (!categorySlug) return null;

	const t = await getTranslations();

	const products = await getProductsByCategorySlug(categorySlug);
	if (!products || products.length === 0) return null;

	const filtered = products
		.filter((p) => p.id !== currentProductId)
		.slice(0, limit);

	if (filtered.length === 0) return null;

	const sectionHeader = (
		<ServerHeader text={t("YouMightAlsoLike")} as="h2" className="mb-4" />
	);

	const productSlides = filtered.map((product) => (
		<ProductCard key={product.id} product={product} />
	));

	// If 3 or fewer, fallback to flex row layout like on the homepage
	if (filtered.length <= 3) {
		return (
			<div className="mt-16">
				{sectionHeader}
				<div className="flex flex-nowrap overflow-x-auto gap-4 pb-4">
					{filtered.map((product) => (
						<div key={product.id}>
							<ProductCard product={product} />
						</div>
					))}
				</div>
			</div>
		);
	}

	// Otherwise, use carousel
	return (
		<div className="mt-16">
			<Carousel
				slides={productSlides}
				header={sectionHeader}
				options={{
					dragFree: true,
					loop: false,
					align: "start",
					containScroll: "trimSnaps",
				}}
				showDots={filtered.length <= 5}
				slideClassName={
					filtered.length <= 4
						? `w-1/${Math.min(filtered.length, 4)}`
						: "w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
				}
			/>
		</div>
	);
};

export default RelatedProducts;