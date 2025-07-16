// client/src/app/[locale]/(admin)/admin/products/page.tsx
import { getAdminProducts } from "@/app/actions/admin/productActions";
import { ServerHeader } from "@/app/[locale]/(components)/Header/ServerHeader";
import ProductsClient from "./components/ProductsClient";
import { getTranslations } from "next-intl/server";

interface ProductsPageProps {
	searchParams: Promise<{
		search?: string;
		page?: number;
	}>;
}

export default async function AdminProductsPage({
	searchParams,
}: ProductsPageProps) {
	const { search, page } = await searchParams;
	const t = await getTranslations();
	// Extract search parameters
	const currentPage = Number(page) || 1;
	const pageSize = 5;
	const sortBy = "id";

	// ✅ Fetch products with search term
	const { products, totalCount } = await getAdminProducts({
		search,
		page: currentPage,
		pageSize,
		sortBy,
	});

	console.log("🔵 Products:", products);

	return (
		<div className="mx-auto pb-4 w-full">
			<ServerHeader text={t("products")} />
			<ProductsClient
				initialProducts={products}
				totalCount={totalCount}
				currentPage={currentPage}
				pageSize={pageSize}
			/>
		</div>
	);
}
