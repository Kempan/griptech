// client/src/app/[locale]/(admin)/admin/categories/components/CreateCategory.tsx
"use client";

import { useState } from "react";
import { PlusCircleIcon } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { useCreateCategoryMutation } from "@/app/state/api";
import { ProductCategory } from "@/app/types";
import { Input } from "@/shadcn/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shadcn/components/ui/select";
import { useTranslations } from "next-intl";

export default function CreateCategory({
	categories,
	onCategoryCreated,
}: {
	categories: ProductCategory[];
	onCategoryCreated: (newCategory: ProductCategory) => void;
}) {
	const [createCategory] = useCreateCategoryMutation();
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [parentId, setParentId] = useState<string | undefined>(undefined);
	const t = useTranslations();
	// ✅ Handle Create Category
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name) {
			alert(t("nameIsRequired"));
			return;
		}

		try {
			const newCategory = await createCategory({
				name,
				slug,
				parentId:
					parentId === "null" || !parentId ? null : parseInt(parentId, 10),
			}).unwrap();

			// ✅ Update categories in UI instantly
			onCategoryCreated(newCategory as ProductCategory);
			console.log(`✅ New category created: ${newCategory.name}`);

			// ✅ Clear input fields
			setName("");
			setSlug("");
			setParentId(undefined);
			window.location.reload(); // temporary fix to display new category
		} catch (error) {
			console.error("❌ Failed to create category:", error);
			alert(t("failedToCreateCategory"));
		}
	};

	// Handle parent selection
	const handleParentChange = (value: string) => {
		setParentId(value);
	};

	return (
		<div className="w-fit">
			<form onSubmit={handleSubmit} className="flex gap-4">
				<Input
					type="text"
					placeholder={t("categoryName")}
					className="bg-white"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>

				<Input
					type="text"
					placeholder={t("categorySlug")}
					value={slug}
					className="bg-white"
					onChange={(e) => setSlug(e.target.value)}
				/>

				{/* ✅ Shadcn Select for parent categories */}
				<Select
					value={parentId || undefined}
					onValueChange={handleParentChange}
				>
					<SelectTrigger className="bg-white">
						<SelectValue placeholder={t("parentCategory")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="null">{t("noParent")}</SelectItem>
						{categories
							.filter((cat) => cat.id !== null) // Filter out categories with null ids
							.map((cat) => (
								<SelectItem
									key={cat.id}
									value={cat.id!.toString()} // Use non-null assertion since we filtered
								>
									{cat.name}
								</SelectItem>
							))}
					</SelectContent>
				</Select>

				<Button>
					<PlusCircleIcon className="w-5 h-5" />
					{t("createCategory")}
				</Button>
			</form>
		</div>
	);
}
