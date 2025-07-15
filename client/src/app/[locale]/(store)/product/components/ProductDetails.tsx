// app/[locale]/(store)/product/components/ProductDetails.tsx
import { Suspense } from "react";
import Header from "@/app/[locale]/(components)/Header/ClientHeader";
import { Badge } from "@/shadcn/components/ui/badge";
import ProductDetailsAuth from "./ProductDetailsAuth";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";

interface ProductDetailsProps {
	product: {
		id: string;
		name: string;
		price: number;
		currency?: string;
		slug: string;
		sizes?: string[];
		stockQuantity?: number;
		enableStockManagement?: boolean;
		categories?: Array<{ name: string; slug: string }>;
	};
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
	const t = useTranslations();
	const {
		id,
		name,
		price,
		currency,
		slug,
		sizes,
		stockQuantity,
		enableStockManagement = false,
		categories = [],
	} = product;
	
	// Use new stock logic
	const inStock = enableStockManagement ? (stockQuantity && stockQuantity > 0) : true;

	return (
		<div className="flex flex-col flex-1 gap-6">
			<div>
				<div className="flex items-end justify-between gap-2 mb-2">
					<Header text={name} className="mb-0" />
					<div className="flex items-center">
						<div
							className={`w-3 h-3 rounded-full mr-2 ${
								inStock ? "bg-green-500" : "bg-red-500"
							}`}
						></div>
						<span
							className={`text-sm ${
								inStock ? "text-green-700" : "text-red-700"
							}`}
						>
							{inStock ? t("InStock") : t("OutOfStock")}
						</span>
					</div>
				</div>

				{categories.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-2">
						{categories.map((category) => (
							<Badge key={category.slug} variant="outline">
								{category.name}
							</Badge>
						))}
					</div>
				)}
			</div>

			{/* Description - visible to everyone */}
			<div className="prose prose-sm max-w-none text-gray-700">
				<p className="leading-relaxed">
					{`${t("OurProductionProcessTakes")} 2-3 ${t("Days")} ${t(
						"AndDeliveryTimeIs"
					)} 3-5 ${t("Days")} ${t("DependingOnLocation")}...`}	
				</p>
				<p className="leading-relaxed mt-2">
					{`${t("DiscoverOur")} "${name}" ${t("Poster")}, ${t(
						"AUniqueAndBeautifulPiece"
					)}...`}
				</p>
			</div>

			{/* ✅ Authentication-aware ProductDetails component with price inside */}
			<Suspense
				fallback={<div className="h-32 animate-pulse bg-gray-100 rounded-lg" />}
			>
				<ProductDetailsAuth
					product={{
						id,
						name,
						price,
						currency,
						slug,
						sizes,
						stockQuantity,
						enableStockManagement,
					}}
				/>
			</Suspense>

			{/* Shipping info - visible to everyone */}
			<div className="mt-2 pt-4 border-t border-gray-200">
				<div className="flex gap-4 text-sm text-gray-500">
					<div>
						<p className="font-medium">{t("FreeShipping")}</p>
						<p>
							{t("OnOrdersOver")} {formatCurrency(50, currency || "SEK")}
						</p>
					</div>
					<div>
						<p className="font-medium">{t("Returns")}</p>
						<p>{t("ThirtyDayReturnPolicy")}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductDetails;
