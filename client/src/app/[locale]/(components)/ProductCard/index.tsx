import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Product } from "@/app/types";
import { useTranslations } from "next-intl";
import AddToCartButton from "@/app/[locale]/(components)/Buttons/AddToCart";
import Price from "@/app/[locale]/(components)/Price";
import { Badge } from "@/shadcn/components/ui/badge";
import FavoriteButton from "@/app/[locale]/(components)/Buttons/FavoriteButton";
import { isOutOfStock, hasLowStock, getStockStatusColor } from "@/app/lib/utils/stock-utils";

interface ProductCardProps {
	product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
	const t = useTranslations();

	// ✅ Get the last category in the array
	const lastCategory =
		product.categories && product.categories.length > 0
			? product.categories[product.categories.length - 1]
			: null;

	return (
		<div key={product.id} className="flex flex-col items-center relative group">
			{/* Favorite button positioned in top-right corner of the image */}
			<div className="absolute top-2 right-2 z-10">
				<FavoriteButton
					productId={product.id}
					productSlug={product.slug}
					size="icon"
					variant="ghost"
					className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
				/>
			</div>

			<Link
				href={{
					pathname: "/product/[slug]",
					params: { slug: product.slug },
				}}
				passHref
				className="flex flex-col items-center"
			>
				<div className="relative overflow-hidden rounded-md mb-2">
					<Image
						src="/images/grip3.jpg"
						alt={product.name}
						width={280}
						height={280}
						className="rounded-md transition-transform duration-300 group-hover:scale-105"
						priority
					/>
				</div>
				<h3 className="text-lg font-semibold text-center">{product.name}</h3>
			</Link>
			<Price
				amount={product.price}
				showLoginButton={false}
				className="text-md"
			/>
			
			{/* Stock status badge */}
			{product.enableStockManagement && (
				<Badge 
					variant={isOutOfStock(product) ? "destructive" : hasLowStock(product) ? "secondary" : "default"}
					className="mt-1"
				>
					{isOutOfStock(product) ? t("OutOfStock") : hasLowStock(product) ? t("LowStock") : t("InStock")}
				</Badge>
			)}
			
			{/* <AddToCartButton product={product} translationKey="AddToCart" className="w-fit" /> */}
		</div>
	);
};

export default ProductCard;
