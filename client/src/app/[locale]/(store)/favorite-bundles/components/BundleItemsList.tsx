// client/src/app/[locale]/(store)/favorite-bundles/components/BundleItemsList.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, GripVertical, Minus, Plus } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { Badge } from "@/shadcn/components/ui/badge";
import { formatCurrency } from "@/app/lib/utils/formatCurrency";
import { useTranslations } from "next-intl";
import { removeProductFromBundle } from "@/app/actions/bundleActions";
import { BundleItem } from "@/app/actions/bundleActions";
import { cn } from "@/shadcn/lib/utils";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
	restrictToVerticalAxis,
	restrictToParentElement,
} from "@dnd-kit/modifiers";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BundleItemsListProps {
	bundleId: number;
	items: BundleItem[];
	onItemsChange: (items: BundleItem[]) => void;
}

export default function BundleItemsList({
	bundleId,
	items,
	onItemsChange,
}: BundleItemsListProps) {
	const t = useTranslations();
	const [localItems, setLocalItems] = useState(items);
	const [mounted, setMounted] = useState(false);

	// Sync local state when items prop changes
	useEffect(() => {
		setLocalItems(items);
	}, [items]);

	// Set mounted state to avoid hydration issues
	useEffect(() => {
		setMounted(true);
	}, []);

	// Drag and drop sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = localItems.findIndex(
				(item) => item.productId === active.id
			);
			const newIndex = localItems.findIndex(
				(item) => item.productId === over.id
			);

			const newOrder = arrayMove(localItems, oldIndex, newIndex);
			setLocalItems(newOrder);
			onItemsChange(newOrder);
		}
	};

	const handleQuantityChange = (productId: number, newQuantity: number) => {
		if (newQuantity < 1) return;

		const updatedItems = localItems.map((item) =>
			item.productId === productId ? { ...item, quantity: newQuantity } : item
		);
		setLocalItems(updatedItems);
		onItemsChange(updatedItems);
	};

	const handleRemoveItem = async (productId: number) => {
		const result = await removeProductFromBundle(bundleId, productId);
		if (result.success) {
			const updatedItems = localItems.filter(
				(item) => item.productId !== productId
			);
			setLocalItems(updatedItems);
			onItemsChange(updatedItems);
		}
	};

	if (localItems.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500">
				{t("NoItemsInBundle")}
			</div>
		);
	}

	// Render without drag and drop until client-side mounted
	if (!mounted) {
		return (
			<div className="space-y-3">
				{localItems.map((item) => (
					<BundleItemRowStatic
						key={item.productId}
						item={item}
						onQuantityChange={handleQuantityChange}
						onRemove={handleRemoveItem}
					/>
				))}
			</div>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
			modifiers={[restrictToVerticalAxis, restrictToParentElement]}
		>
			<SortableContext
				items={localItems.map((item) => item.productId)}
				strategy={verticalListSortingStrategy}
			>
				<div className="space-y-3">
					{localItems.map((item) => (
						<BundleItemRow
							key={item.productId}
							item={item}
							onQuantityChange={handleQuantityChange}
							onRemove={handleRemoveItem}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}

interface BundleItemRowProps {
	item: BundleItem;
	onQuantityChange: (productId: number, quantity: number) => void;
	onRemove: (productId: number) => void;
}

function BundleItemRow({
	item,
	onQuantityChange,
	onRemove,
}: BundleItemRowProps) {
	const t = useTranslations();
	const [isRemoving, setIsRemoving] = useState(false);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.productId });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	if (!item.product) return null;

	const maxQuantity =
		item.product.stockQuantity && item.product.stockQuantity < 99
			? item.product.stockQuantity
			: 99;

	const handleRemove = async () => {
		setIsRemoving(true);
		await onRemove(item.productId);
		setIsRemoving(false);
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"bg-white rounded-lg border p-4 transition-all duration-200",
				isDragging && "opacity-50 shadow-xl z-50"
			)}
		>
			<div className="flex gap-4 items-center">
				{/* Drag handle */}
				<div
					{...attributes}
					{...listeners}
					className="flex items-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
				>
					<GripVertical className="w-5 h-5" />
				</div>

				{/* Product image */}
				<Link href={`/product/${item.product.slug}`} className="flex-shrink-0">
					<Image
						src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_PREFIX}/apelsin.jpg`}
						alt={item.product.name}
						width={80}
						height={80}
						className="rounded-md object-cover"
					/>
				</Link>

				{/* Product details */}
				<div className="flex-1 min-w-0">
					<Link href={`/product/${item.product.slug}`} className="block">
						<h3 className="font-semibold truncate hover:text-blue-600 transition-colors">
							{item.product.name}
						</h3>
					</Link>

					<div className="mt-1 space-y-1">
						<p className="text-lg font-bold text-gray-800">
							{formatCurrency(item.product.price, "SEK")}
						</p>

						{item.product.categories && item.product.categories.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{item.product.categories.map((cat) => (
									<Badge key={cat.id} variant="secondary" className="text-xs">
										{cat.name}
									</Badge>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Quantity controls */}
				<div className="flex items-center gap-2">
					<Button
						size="icon"
						variant="outline"
						className="h-8 w-8"
						onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
						disabled={item.quantity <= 1}
					>
						<Minus className="h-3 w-3" />
					</Button>

					<Input
						type="number"
						min={1}
						max={maxQuantity}
						value={item.quantity}
						onChange={(e) => {
							const value = parseInt(e.target.value);
							if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
								onQuantityChange(item.productId, value);
							}
						}}
						className="w-16 h-8 text-center"
					/>

					<Button
						size="icon"
						variant="outline"
						className="h-8 w-8"
						onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
						disabled={item.quantity >= maxQuantity}
					>
						<Plus className="h-3 w-3" />
					</Button>
				</div>

				{/* Subtotal */}
				<div className="text-right min-w-[100px]">
					<p className="text-sm text-gray-500">{t("Subtotal")}</p>
					<p className="font-semibold">
						{formatCurrency(item.product.price * item.quantity, "SEK")}
					</p>
				</div>

				{/* Remove button */}
				<Button
					size="icon"
					variant="ghost"
					onClick={handleRemove}
					disabled={isRemoving}
					className="text-red-600 hover:text-red-700 hover:bg-red-50"
				>
					<Trash2 className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}

// Static version without drag functionality for SSR
function BundleItemRowStatic({
	item,
	onQuantityChange,
	onRemove,
}: BundleItemRowProps) {
	const t = useTranslations();
	const [isRemoving, setIsRemoving] = useState(false);

	if (!item.product) return null;

	const maxQuantity =
		item.product.stockQuantity && item.product.stockQuantity < 99
			? item.product.stockQuantity
			: 99;

	const handleRemove = async () => {
		setIsRemoving(true);
		await onRemove(item.productId);
		setIsRemoving(false);
	};

	return (
		<div className="bg-white rounded-lg border p-4">
			<div className="flex gap-4 items-center">
				{/* Drag handle (disabled) */}
				<div className="flex items-center text-gray-400">
					<GripVertical className="w-5 h-5" />
				</div>

				{/* Product image */}
				<Link href={`/product/${item.product.slug}`} className="flex-shrink-0">
					<Image
						src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_PREFIX}/apelsin.jpg`}
						alt={item.product.name}
						width={80}
						height={80}
						className="rounded-md object-cover"
					/>
				</Link>

				{/* Product details */}
				<div className="flex-1 min-w-0">
					<Link href={`/product/${item.product.slug}`} className="block">
						<h3 className="font-semibold truncate hover:text-blue-600 transition-colors">
							{item.product.name}
						</h3>
					</Link>

					<div className="mt-1 space-y-1">
						<p className="text-lg font-bold text-gray-800">
							{formatCurrency(item.product.price, "SEK")}
						</p>

						{item.product.categories && item.product.categories.length > 0 && (
							<div className="flex flex-wrap gap-1">
								{item.product.categories.map((cat) => (
									<Badge key={cat.id} variant="secondary" className="text-xs">
										{cat.name}
									</Badge>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Quantity controls */}
				<div className="flex items-center gap-2">
					<Button
						size="icon"
						variant="outline"
						className="h-8 w-8"
						onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
						disabled={item.quantity <= 1}
					>
						<Minus className="h-3 w-3" />
					</Button>

					<Input
						type="number"
						min={1}
						max={maxQuantity}
						value={item.quantity}
						onChange={(e) => {
							const value = parseInt(e.target.value);
							if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
								onQuantityChange(item.productId, value);
							}
						}}
						className="w-16 h-8 text-center"
					/>

					<Button
						size="icon"
						variant="outline"
						className="h-8 w-8"
						onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
						disabled={item.quantity >= maxQuantity}
					>
						<Plus className="h-3 w-3" />
					</Button>
				</div>

				{/* Subtotal */}
				<div className="text-right min-w-[100px]">
					<p className="text-sm text-gray-500">{t("Subtotal")}</p>
					<p className="font-semibold">
						{formatCurrency(item.product.price * item.quantity, "SEK")}
					</p>
				</div>

				{/* Remove button */}
				<Button
					size="icon"
					variant="ghost"
					onClick={handleRemove}
					disabled={isRemoving}
					className="text-red-600 hover:text-red-700 hover:bg-red-50"
				>
					<Trash2 className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}
