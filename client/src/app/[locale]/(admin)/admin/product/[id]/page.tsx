// client/src/app/[locale]/(admin)/admin/product/[id]/page.tsx
import { getProductById } from "@/app/actions/productActions";
import { getCategories } from "@/app/actions/productCategoryActions";
import { ServerHeader } from "@/app/[locale]/(components)/Header/ServerHeader";
import { Button } from "@/shadcn/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "../components/ProductDetailClient";
import { getTranslations } from "next-intl/server";

interface ProductDetailProps {
	params: Promise<{
		id: string;
		locale: string;
	}>;
}

export default async function ProductDetail({ params }: ProductDetailProps) {
	const { id, locale } = await params;
	const productId = parseInt(id, 10);
	const t = await getTranslations();


	try {
		// Fetch product and categories data in parallel
		const [product, categories] = await Promise.all([
			getProductById(productId),
			getCategories(),
		]);

		if (!product) {
			return notFound();
		}

		return (
			<div className="flex flex-col">
				<div className="flex justify-between items-center">
					<ServerHeader text={`Product: ${product.name}`} />
					<Link href={`/${locale}/admin/products`}>
						<Button variant="outline">{t("backToProducts")}</Button>
					</Link>
				</div>

				<ProductDetailClient
					product={product}
					categories={categories}
					locale={locale}
				/>
			</div>
		);
	} catch (error) {
		console.error("Error fetching product:", error);
		return (
			<div className="flex flex-col">
				<ServerHeader text="Product Detail" />
				<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mt-4">
					<p className="text-red-500">{t("failedToLoadProductDetails")}</p>
					<Link
						href={`/${locale}/admin/products`}
						className="mt-4 inline-block"
					>
						<Button variant="outline">{t("backToProducts")}</Button>
					</Link>
				</div>
			</div>
		);
	}
}
