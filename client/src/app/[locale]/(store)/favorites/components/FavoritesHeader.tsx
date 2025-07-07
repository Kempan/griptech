// client/src/app/[locale]/(store)/favorites/components/FavoritesHeader.tsx
"use client";

import { Heart, SortAsc } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shadcn/components/ui/dropdown-menu";

export default function FavoritesHeader() {
	const t = useTranslations();
	const [sortBy, setSortBy] = useState<"custom" | "date" | "name" | "price">(
		"custom"
	);

	return (
		<div className="mb-6">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					{/* <Heart className="w-8 h-8 text-red-500 fill-red-500" /> */}
					{/* <h1 className="text-3xl font-bold">{t("MyFavorites")}</h1> */}
				</div>

				{/* <DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm">
							<SortAsc className="w-4 h-4 mr-2" />
							{t("Sort")}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setSortBy("custom")}>
							{t("CustomOrder")}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setSortBy("date")}>
							{t("DateAdded")}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setSortBy("name")}>
							{t("ProductName")}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setSortBy("price")}>
							{t("Price")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu> */}
			</div>

			{/* <p className="text-gray-600">{t("DragToReorder")}</p> */}
		</div>
	);
}
