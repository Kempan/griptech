"use client";

import { Button, ButtonProps } from "@/shadcn/components/ui/button";
import { useTranslations } from "next-intl";
import { useCart } from "@/app/state/cartHooks";
import { LucideIcon } from "lucide-react";

interface AddToCartButtonProps extends ButtonProps {
	product: {
		id: string;
		name: string;
		price: number;
		slug: string;
		size: string;
	};
	quantity: number;
	translationKey: string;
	icon?: LucideIcon;
	cartItemId: string;
}

const AddToCartButton = ({
	product,
	quantity,
	translationKey,
	icon: Icon,
	cartItemId,
	...props
}: AddToCartButtonProps) => {
	const t = useTranslations();
	const { addItemToCart } = useCart();

	const handleAddToCart = () => {
		addItemToCart({
			productId: product.id,
			name: product.name,
			price: product.price,
			quantity,
			size: product.size,
			slug: product.slug,
			cartItemId: cartItemId,
		});
	};

	return (
		<Button {...props} onClick={handleAddToCart}>
			{Icon && <Icon className="w-4 h-4" />} {t(translationKey)}
		</Button>
	);
};

export default AddToCartButton;
