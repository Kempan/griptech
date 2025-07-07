"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/types";
import { useTranslations } from "next-intl";
import AddToCartButton from "@/app/[locale]/(components)/Buttons/AddToCart";

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
		<div key={product.id} className="flex flex-col items-center">
			<Link
				href={`/admin/product/${product.id}`}
				className="flex flex-col items-center"
			>
				<Image
					src="/images/grip3.jpg"
					alt={product.name}
					width={280}
					height={280}
					priority
          className="rounded-md mb-2"
				/>
				<h3 className="text-lg font-semibold">{product.name}</h3>
			</Link>
			<p className="text-md">${product.price}</p>
			{lastCategory ? (
				<>
					<div className="text-md">
						{t("Category")}:{" "}
						<span className="font-semibold">{lastCategory.name}</span>
					</div>
				</>
			) : (
				t("Uncategorized")
			)}
			{/* <AddToCartButton product={product} translationKey="AddToCart" className="w-fit" /> */}
		</div>
	);
};

export default ProductCard;
