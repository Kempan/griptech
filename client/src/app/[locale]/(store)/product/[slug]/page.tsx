// src/app/[locale]/(store)/product/[slug]/page.tsx
import { Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";
import {
	getProductBySlug,
	getProductsByCategorySlug,
} from "@/app/actions/productActions";
import ProductImageGallery from "../components/ProductImageGallery";
import ProductDetails from "../components/ProductDetails";
import RelatedProducts from "../components/RelatedProducts";
import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import { ProductDetailsSkeleton } from "../components/ProductSkeletons";

// Generate metadata for SEO
export async function generateMetadata(
	{
		params,
	}: {
		params: Promise<{ slug: string }>;
	},
	parent: ResolvingMetadata
): Promise<Metadata> {

	const { slug } = await params;

	const product = await getProductBySlug(slug);

	// Get base URL for canonical link from parent metadata
	const previousImages = (await parent).openGraph?.images || [];

	// Use SEO metadata fields if available, otherwise fall back to defaults
	const title = product.metaTitle || `${product.name} | Griptech`;
	const description =
		product.metaDescription ||
		product.shortDescription ||
		`Shop ${product.name} from our premium collection. Available in multiple sizes and high-quality materials.`;
	const keywords =
		product.metaKeywords ||
		`poster, print, ${product.name}, home decor, wall art`;

	return {
		title,
		description,
		keywords,
		openGraph: {
			images: [
				`${process.env.NEXT_PUBLIC_AWS_BUCKET_PREFIX}/product-2.jpeg`,
				...previousImages,
			],
			title: product.metaTitle || product.name,
			description:
				product.metaDescription ||
				product.shortDescription ||
				`High-quality ${product.name} print. Available in multiple sizes.`,
		},
	};
}

export default async function ProductPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	// ✅ Await directly instead of using `use()`
	const product = await getProductBySlug(slug);

	const categoryIds =
		product.categories?.map((cat: { slug: string }) => cat.slug) ?? [];

	const relatedProductsPromise =
		categoryIds.length > 0
			? getProductsByCategorySlug(categoryIds[0])
			: Promise.resolve([]);

	const productImages = [
		`/images/grip3.jpg`,
		`/images/grip2.webp`,
	];

	return (
		<SectionWrapper className="pt-6">
			<InnerWrapper>
				<div className="flex flex-col items-start gap-6 md:flex-row">
					{/* ⛔ DO NOT wrap client components in Suspense */}
					<ProductImageGallery
						productName={product.name}
						productImages={productImages}
					/>

					<Suspense fallback={<ProductDetailsSkeleton />}>
						<ProductDetails product={product} />
					</Suspense>
				</div>

				<Suspense
					fallback={
						<div className="mt-12 h-72 animate-pulse bg-gray-100 rounded-lg" />
					}
				>
					<RelatedProducts
						categorySlug={categoryIds[0]}
						currentProductId={product.id}
					/>
				</Suspense>
			</InnerWrapper>
		</SectionWrapper>
	);
}
