// client/src/app/[locale]/(store)/favorites/components/FavoritesList.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { getUserFavorites } from "@/app/actions/favoriteActions"
import FavoriteItem from "./FavoriteItem"
import { Favorite } from "@/app/actions/favoriteActions"
import { useTranslations } from "next-intl"
import { Heart, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/shadcn/components/ui/button"
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core"
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
	restrictToVerticalAxis,
	restrictToParentElement,
} from "@dnd-kit/modifiers"

export default function FavoritesList() {
	const t = useTranslations()
	const [favorites, setFavorites] = useState<Favorite[]>([])
	const [loading, setLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)

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
	)

	const loadFavorites = useCallback(async () => {
		setLoading(true)
		try {
			const response = await getUserFavorites({ page: currentPage, pageSize: 12 })
			setFavorites(response.favorites)
			setTotalPages(response.pageCount)
		} catch (error) {
			console.error("Error loading favorites:", error)
		} finally {
			setLoading(false)
		}
	}, [currentPage])

	useEffect(() => {
		loadFavorites()
	}, [loadFavorites])

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (over && active.id !== over.id) {
			setFavorites((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id)
				const newIndex = items.findIndex((item) => item.id === over.id)
				
				const newOrder = arrayMove(items, oldIndex, newIndex)
				
				// Here you could save the new order to the backend
				// saveCustomOrder(newOrder.map(item => item.id))
				
				return newOrder
			})
		}
	}

	const handleRemove = (favoriteId: number) => {
		setFavorites(favorites.filter(fav => fav.id !== favoriteId))
	}

	if (loading) {
		return <div className="text-center py-8">{t("Loading")}...</div>
	}

	if (favorites.length === 0) {
		return (
			<div className="text-center py-12 bg-gray-50 rounded-lg">
				<Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
				<h2 className="text-xl font-semibold mb-2">{t("NoFavorites")}</h2>
				<p className="text-gray-600 mb-6">{t("StartAddingFavorites")}</p>
				<Link href="/products">
					<Button>
						<ShoppingBag className="w-4 h-4 mr-2" />
						{t("BrowseProducts")}
					</Button>
				</Link>
			</div>
		)
	}

	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
				modifiers={[restrictToVerticalAxis, restrictToParentElement]}
			>
				<SortableContext
					items={favorites.map(fav => fav.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="space-y-4">
						{favorites.map((favorite) => (
							<FavoriteItem
								key={favorite.id}
								favorite={favorite}
								onRemove={handleRemove}
							/>
						))}
					</div>
				</SortableContext>
			</DndContext>

			{totalPages > 1 && (
				<div className="flex justify-center gap-2 mt-8">
					<Button
						variant="outline"
						onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
						disabled={currentPage === 1}
					>
						{t("Previous")}
					</Button>
					<span className="py-2 px-4">
						{t("Page")} {currentPage} {t("of")} {totalPages}
					</span>
					<Button
						variant="outline"
						onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
						disabled={currentPage === totalPages}
					>
						{t("Next")}
					</Button>
				</div>
			)}
		</>
	)
}