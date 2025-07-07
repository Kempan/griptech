import { Skeleton } from "@/shadcn/components/ui/skeleton";

// Skeleton for product images during loading
export function ProductImageSkeleton() {
	return (
		<div className="flex flex-col flex-1 gap-3 w-full md:w-1/2">
			{/* Main image skeleton */}
			<Skeleton className="aspect-square w-full h-auto rounded-lg" />

			{/* Thumbnail skeletons */}
			<div className="flex gap-3 items-start">
				{[1, 2].map((i) => (
					<Skeleton key={i} className="w-24 h-24 rounded-lg" />
				))}
			</div>
		</div>
	);
}

// Skeleton for product details during loading
export function ProductDetailsSkeleton() {
	return (
		<div className="flex flex-col flex-1 gap-5">
			{/* Title skeleton */}
			<div>
				<Skeleton className="h-8 w-3/4 mb-2" />
				<div className="flex gap-2 mt-2">
					<Skeleton className="h-5 w-16 rounded-full" />
					<Skeleton className="h-5 w-20 rounded-full" />
				</div>
			</div>

			{/* Stock status skeleton */}
			<Skeleton className="h-5 w-24" />

			{/* Description skeletons */}
			<div className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-4 w-full" />
			</div>

			{/* Size picker skeleton */}
			<Skeleton className="h-24 w-full" />

			{/* Price and quantity skeleton */}
			<div className="flex justify-between">
				<Skeleton className="h-10 w-24" />
				<Skeleton className="h-10 w-28" />
			</div>

			{/* Button skeletons */}
			<div className="space-y-3">
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		</div>
	);
}

// Skeleton for entire product page
export function ProductPageSkeleton() {
	return (
		<div className="flex flex-col items-start gap-6 md:flex-row w-full">
			<ProductImageSkeleton />
			<ProductDetailsSkeleton />
		</div>
	);
}
