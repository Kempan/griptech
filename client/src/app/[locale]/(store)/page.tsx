import React, { Suspense } from "react";
import {
	getProducts,
	getProductsByCategorySlug,
} from "@/app/actions/productActions";
import Carousel from "@/app/[locale]/(components)/store/Carousel";
import ProductCard from "@/app/[locale]/(components)/ProductCard";
import { SectionWrapper } from "@/app/[locale]/(components)/Wrappers";
import { ServerHeader } from "@/app/[locale]/(components)/Header/ServerHeader";
import { Button } from "@/shadcn/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Product } from "@/app/types";

// Updated ProductsSection with single row layout for grid views
async function ProductsSection({ limit = 15 }: { limit?: number }) {
	// Use getTranslations instead of useTranslations in a server component
	const t = await getTranslations();
	const products = (await getProducts({ limit })) as Product[];

	// If no products, don't show the section
	if (!products || products.length === 0) {
		return null;
	}

	// Create slides from product cards
	const productSlides = products.map((product) => (
		<ProductCard key={product.id} product={product} />
	));

	// Create section header with "View All" button
	const sectionHeader = (
		<div className="flex justify-between items-center mb-2">
			<ServerHeader text={t("AllProducts")} as="h2" />
			<Link href="/products">
				<Button>
					{t("AllProducts")} <ArrowRight className="h-4 w-4" />
				</Button>
			</Link>
		</div>
	);

	// If few products, render as a flex row instead of grid
	if (products.length <= 3) {
		return (
			<div>
				{sectionHeader}
				<div className="flex flex-nowrap overflow-x-auto gap-4 pb-4">
					{products.map((product: Product) => (
						<div
							key={product.id}
						>
							<ProductCard product={product} />
						</div>
					))}
				</div>
			</div>
		);
	}

	// For more products, use carousel
	return (
		<Carousel
			slides={productSlides}
			header={sectionHeader}
			options={{
				dragFree: true,
				loop: false,
				align: "start",
				containScroll: "trimSnaps",
			}}
			autoplay={true}
			autoplayInterval={8000}
		/>
	);
}

// Updated CategoryProductsSection with single row layout for grid views
async function CategoryProductsSection({
	category,
	header,
	limit = 15,
}: {
	category: string;
	header: string;
	limit?: number;
}) {
	// Use getTranslations instead of useTranslations in a server component
	const t = await getTranslations();
	const products = await getProductsByCategorySlug(category);

	// If no products, don't show the section
	if (!products || products.length === 0) {
		return null;
	}

	// Limit the number of products
	const limitedProducts = products.slice(0, limit);

	// Create section header with "View All" button
	const sectionHeader = (
		<div className="flex justify-between items-center mb-2">
			<ServerHeader text={header} as="h2" />
			<Link
				href={{
					pathname: "/product-category/[slug]",
					params: { slug: category },
				}}
			>
				<Button>
					{t("ViewAll")} <ArrowRight className="h-4 w-4" />
				</Button>
			</Link>
		</div>
	);

	// Create slides from product cards
	const productSlides = limitedProducts.map((product) => (
		<ProductCard key={product.id} product={product} />
	));

	// If few products, render as a flex row instead of grid
	if (limitedProducts.length <= 3) {
		return (
			<div>
				{sectionHeader}
				<div className="flex flex-nowrap overflow-x-auto gap-4 pb-4">
					{limitedProducts.map((product) => (
						<div
							key={product.id}
						>
							<ProductCard product={product} />
						</div>
					))}
				</div>
			</div>
		);
	}

	// For more products, use carousel
	return (
		<Carousel
			slides={productSlides}
			header={sectionHeader}
			options={{
				dragFree: true,
				loop: false,
				align: "start",
				containScroll: "trimSnaps",
			}}
			showDots={limitedProducts.length <= 5}
			slideClassName={
				limitedProducts.length <= 4
					? `w-1/${Math.min(limitedProducts.length, 4)}`
					: "w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
			}
		/>
	);
}

// Homepage with new components
export default async function Home() {
	// We need to use getTranslations since this is a server component
	const t = await getTranslations();

	return (
		<div className="flex flex-col space-y-16 py-6 px-3 md:p-6">
			<SectionWrapper>
				<Suspense
					fallback={
						<div className="h-80 animate-pulse bg-gray-100 rounded-lg" />
					}
				>
					<ProductsSection limit={15} />
				</Suspense>
			</SectionWrapper>

			<SectionWrapper>
				<Suspense
					fallback={
						<div className="h-80 animate-pulse bg-gray-100 rounded-lg" />
					}
				>
					<CategoryProductsSection
						header={`${t("Socks")}`}
						category="grepp"
						limit={15}
					/>
				</Suspense>
			</SectionWrapper>

			<SectionWrapper>
				<Suspense
					fallback={
						<div className="h-80 animate-pulse bg-gray-100 rounded-lg" />
					}
				>
					<CategoryProductsSection
						header={`${t("Grips")}`}
						category="grepp"
						limit={15}
					/>
				</Suspense>
			</SectionWrapper>
		</div>
	);
}
