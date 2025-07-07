"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/shadcn/lib/utils";

interface ProductImageGalleryProps {
	productName: string;
	productImages?: string[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
	productName,
	productImages = [],
}) => {
	// Use provided images or default if none provided
	const images =
		productImages.length > 0
			? productImages
			: Array.from(
					{ length: 2 },
					(_, i) =>
						`/images/grip${i + 3}.jpg`
			  );

	const [activeImage, setActiveImage] = useState(0);

	return (
		<div className="flex flex-col flex-1 gap-3 w-full md:w-1/2">
			{/* Main product image */}
			<div className="relative group">
				<Image
					src={images[activeImage]}
					alt={productName}
					width={800}
					height={800}
					priority
					sizes="(max-width: 768px) 100vw, 50vw"
					className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800 transition duration-300"
				/>
			</div>

			{/* Thumbnail images */}
			<div className="flex gap-3 items-start">
				{images.map((image, i) => (
					<button
						key={i}
						onClick={() => setActiveImage(i)}
						className={cn(
							"border rounded-lg overflow-hidden transition-colors dark:hover:border-gray-50",
							activeImage === i && "ring-2 ring-gray-800"
						)}
						aria-label={`View image ${i + 1} of ${images.length}`}
					>
						<Image
							src={image}
							alt={`${productName} ${i + 1}`}
							width={120}
							height={120}
							className="aspect-square object-cover w-full rounded-lg overflow-hidden dark:border-gray-800"
						/>
					</button>
				))}
			</div>
		</div>
	);
};

export default ProductImageGallery;
