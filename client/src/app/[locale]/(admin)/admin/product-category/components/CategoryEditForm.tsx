"use client";

import { useState, useCallback } from "react";
import { Button } from "@/shadcn/components/ui/button";
import { useRouter } from "next/navigation";
import {
	updateCategory,
	deleteCategory,
} from "@/app/actions/admin/categoryActions";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import { Textarea } from "@/shadcn/components/ui/textarea";
import { ProductCategory } from "@/app/types";
import { useGetCategoriesQuery } from "@/app/state/api";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/shadcn/components/ui/tabs";
import { toast } from "sonner";
import { formatDateDisplay } from "@/app/lib/utils/formatDate";
import { useTranslations } from "next-intl";

interface CategoryEditFormProps {
	category: ProductCategory;
	locale: string;
}

export default function CategoryEditForm({
	category,
	locale,
}: CategoryEditFormProps) {
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [activeTab, setActiveTab] = useState("general");
	const t = useTranslations();
	// General fields
	const [name, setName] = useState(category.name);
	const [slug, setSlug] = useState(category.slug);
	const [parentId, setParentId] = useState<number | null>(
		category.parentId || null
	);

	// SEO fields
	const [metaTitle, setMetaTitle] = useState(category.metaTitle || "");
	const [metaDescription, setMetaDescription] = useState(
		category.metaDescription || ""
	);
	const [metaKeywords, setMetaKeywords] = useState(category.metaKeywords || "");
	const [description, setDescription] = useState(category.description || "");

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	// Fetch all categories for parent selection
	const { data: allCategories = [] } = useGetCategoriesQuery();

	// Filter out the current category and its children to prevent circular references
	const availableParents = allCategories.filter(
		(cat) => cat.id !== category.id
	);

	// Using useCallback to memoize handlers to prevent unnecessary recreations
	const handleDescriptionChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setDescription(e.target.value);
		},
		[]
	);

	const handleNameChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setName(e.target.value);
		},
		[]
	);

	const handleSlugChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSlug(e.target.value);
		},
		[]
	);

	const handleMetaTitleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setMetaTitle(e.target.value);
		},
		[]
	);

	const handleMetaDescriptionChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setMetaDescription(e.target.value);
		},
		[]
	);

	const handleMetaKeywordsChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setMetaKeywords(e.target.value);
		},
		[]
	);

	// Handle parent selection - convert string to number or null
	const handleParentChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			const value = e.target.value;
			setParentId(value === "" ? null : parseInt(value, 10));
		},
		[]
	);

	// Save category changes
	const handleSave = async () => {
		if (!name || !slug) {
			setError(t("nameAndSlugRequired"));
			return;
		}

		if (!category.id) {
			setError(t("invalidCategoryId"));
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			const result = await updateCategory(category.id, {
				name,
				slug,
				parentId,
				description,
				metaTitle,
				metaDescription,
				metaKeywords,
			});

			if (result) {
				setIsEditing(false);
				router.refresh();
				toast.success(t("categoryUpdatedSuccessfully"));
			} else {
				setError(t("failedToUpdateCategory"));
			}
		} catch (err) {
			setError(t("errorOccurredWhileUpdatingCategory"));
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle category deletion
	const handleDelete = async () => {
		if (
			!confirm(
				t("areYouSureYouWantToDeleteThisCategory")
			)
		) {
			return;
		}

		if (!category.id) {
			setError(t("invalidCategoryId"));
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await deleteCategory(category.id);
			if (result) {
				router.push(`/${locale}/admin/categories`);
			} else {
				setError(t("failedToDeleteCategory"));
			}
		} catch (err) {
			setError(t("errorOccurredWhileDeletingCategory"));
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Reset form to initial state
	const handleCancel = () => {
		setIsEditing(false);
		setName(category.name);
		setSlug(category.slug);
		setParentId(category.parentId || null);
		setMetaTitle(category.metaTitle || "");
		setMetaDescription(category.metaDescription || "");
		setMetaKeywords(category.metaKeywords || "");
		setDescription(category.description || "");
		setError("");
	};

	// CategoryInfo component - same as before
	const CategoryInfo = () => (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<div className="mb-4">
					<p className="text-sm text-gray-500">{t("id")}</p>
					<p className="font-medium">{category.id}</p>
				</div>

				<div className="mb-4">
					<p className="text-sm text-gray-500">{t("name")}</p>
					<p className="font-medium">{category.name}</p>
				</div>

				<div className="mb-4">
					<p className="text-sm text-gray-500">{t("slug")}</p>
					<p className="font-medium">{category.slug}</p>
				</div>

				<div className="mb-4">
					<p className="text-sm text-gray-500">{t("parentCategory")}</p>
					<p className="font-medium">
						{category.parentId
							? allCategories.find((c) => c.id === category.parentId)?.name ||
							  `ID: ${category.parentId}`
							: "None"}
					</p>
				</div>

				<div className="mb-4">
					<p className="text-sm text-gray-500">{t("description")}</p>
					<p className="font-medium">{category.description}</p>
				</div>
			</div>

			<div>
				{category.createdAt && (
					<div className="mb-4">
						<p className="text-sm text-gray-500">{t("created")}</p>
						<p className="font-medium">
							{formatDateDisplay(category.createdAt)}
						</p>
					</div>
				)}

				{category.updatedAt && (
					<div className="mb-4">
						<p className="text-sm text-gray-500">{t("lastUpdated")}</p>
						<p className="font-medium">
							{formatDateDisplay(category.updatedAt)}
						</p>
					</div>
				)}

				{category.children && category.children.length > 0 && (
					<div className="mb-4">
						<p className="text-sm text-gray-500">
							{t("childCategories")} ({category.children.length})
						</p>
						<ul className="list-disc list-inside mt-1">
							{category.children.map((child) => (
								<li key={child.id} className="font-medium">
									{child.name}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* SEO Fields Display */}
				{(category.metaTitle ||
					category.metaDescription ||
					category.description ||
					category.metaKeywords) && (
					<div className="mb-4">
						<p className="text-sm text-gray-500">{t("seoConfiguration")}</p>
						<p className="text-xs text-green-600 mt-1">
							{t("customizedForSearchEngines")}
						</p>
					</div>
				)}
			</div>
		</div>
	);

	if (!isEditing) {
		return (
			<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mt-4">
				{error && (
					<div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
						{error}
					</div>
				)}

				<h2 className="text-xl font-semibold mb-6">{t("categoryDetails")}</h2>

				<CategoryInfo />

				<div className="mt-6 flex gap-2">
					<Button onClick={() => setIsEditing(true)}>{t("editCategory")}</Button>
					<Button
						variant="error"
						onClick={handleDelete}
						disabled={isSubmitting}
					>
						{isSubmitting ? t("deleting") : t("deleteCategory")}
					</Button>
				</div>
			</div>
		);
	}

	// Render edit form directly instead of through a component function
	return (
		<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mt-4">
			{error && (
				<div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
					{error}
				</div>
			)}

			<h2 className="text-xl font-semibold mb-6">{t("categoryDetails")}</h2>

			<Tabs
				defaultValue="general"
				className="mt-4"
				onValueChange={setActiveTab}
				value={activeTab}
			>
				<TabsList className="mb-4">
					<TabsTrigger value="general">{t("general")}</TabsTrigger>
					<TabsTrigger value="seo">{t("seoMetadata")}</TabsTrigger>
				</TabsList>

				<TabsContent value="general" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<div className="mb-4">
								<p className="text-sm text-gray-500">{t("id")}</p>
								<p className="font-medium">{category.id}</p>
							</div>

							<div className="mb-4">
								<Label htmlFor="name">{t("name")}</Label>
								<Input
									id="name"
									value={name}
									onChange={handleNameChange}
									className="mt-1"
								/>
							</div>

							<div className="mb-4">
								<Label htmlFor="slug">{t("slug")}</Label>
								<Input
									id="slug"
									value={slug}
									onChange={handleSlugChange}
									className="mt-1"
								/>
							</div>

							<div className="mb-4">
								<Label htmlFor="parentId">{t("parentCategory")}</Label>
								<select
									id="parentId"
									value={parentId?.toString() || ""}
									onChange={handleParentChange}
									className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-gray-800 focus:border-gray-800"
								>
									<option value="">{t("noParent")}</option>
									{availableParents.map((cat) => (
										<option
											key={cat.id}
											value={cat.id || ""}
											disabled={cat.id === category.id}
										>
											{cat.name}
										</option>
									))}
								</select>
							</div>

							<div className="mb-4">
								<Label htmlFor="description">{t("description")}</Label>
								<Textarea
									id="description"
									value={description}
									onChange={handleDescriptionChange}
									className="mt-1"
									placeholder={t("categoryDescription")}
								/>
								<p className="text-xs text-gray-500 mt-1">
									{t("usedForCategoryListingsAndFallbackForMetaDescription")}
								</p>
							</div>
						</div>

						<div>
							{category.createdAt && (
								<div className="mb-4">
									<p className="text-sm text-gray-500">{t("created")}</p>
									<p className="font-medium">
										{formatDateDisplay(category.createdAt)}
									</p>
								</div>
							)}

							{category.updatedAt && (
								<div className="mb-4">
									<p className="text-sm text-gray-500">{t("lastUpdated")}</p>
									<p className="font-medium">
										{formatDateDisplay(category.updatedAt)}
									</p>
								</div>
							)}
						</div>
					</div>
				</TabsContent>

				<TabsContent value="seo" className="space-y-4">
					<div className="max-w-2xl">
						<div className="mb-4">
							<Label htmlFor="metaTitle">{t("metaTitle")}</Label>
							<Input
								id="metaTitle"
								value={metaTitle}
								onChange={handleMetaTitleChange}
								className="mt-1"
								placeholder="Custom page title for search engines"
							/>
							<p className="text-xs text-gray-500 mt-1">
								{t("leaveEmptyToUseCategoryName")}
							</p>
						</div>

						<div className="mb-4">
							<Label htmlFor="metaDescription">{t("metaDescription")}</Label>
							<Textarea
								id="metaDescription"
								value={metaDescription}
								onChange={handleMetaDescriptionChange}
								className="mt-1"
								rows={3}
								placeholder={t("descriptionForSearchEngineResults")}
							/>
							<p className="text-xs text-gray-500 mt-1">
								{metaDescription.length}/155 characters
							</p>
						</div>

						<div className="mb-4">
							<Label htmlFor="metaKeywords">{t("metaKeywords")}</Label>
							<Input
								id="metaKeywords"
								value={metaKeywords}
								onChange={handleMetaKeywordsChange}
								className="mt-1"
								placeholder={t("commaSeparatedKeywords")}
							/>
							<p className="text-xs text-gray-500 mt-1">
								{t("separateKeywordsWithCommas")}
							</p>
						</div>
					</div>
				</TabsContent>
			</Tabs>

			<div className="mt-6 flex gap-2">
				<Button onClick={handleSave} disabled={isSubmitting}>
					{isSubmitting ? t("saving") : t("saveChanges")}
				</Button>
				<Button
					variant="outline"
					onClick={handleCancel}
					disabled={isSubmitting}
				>
					{t("cancel")}
				</Button>
			</div>
		</div>
	);
}
