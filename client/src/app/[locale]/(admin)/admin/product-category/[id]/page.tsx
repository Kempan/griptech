// client/src/app/[locale]/(admin)/admin/product-category/[id]/page.tsx

import { getCategoryById } from "@/app/actions/admin/categoryActions";
import Header from "@/app/[locale]/(components)/Header/ClientHeader";
import CategoryEditForm from "../components/CategoryEditForm";
import Link from "next/link";
import { Button } from "@/shadcn/components/ui/button";
import { notFound } from "next/navigation";

interface CategoryDetailProps {
	params: Promise<{
		id: string;
		locale: string;
	}>;
}

export default async function CategoryDetail({ params }: CategoryDetailProps) {
	// Await the params before using them
	const { id, locale } = await params;
	const categoryId = parseInt(id, 10);
	
	try {
		// You'll need to create this action in your categoryActions.ts file
		const category = await getCategoryById(categoryId);

		if (!category) {
			return notFound();
		}

		return (
			<div className="flex flex-col">
				<div className="flex justify-between items-center">
					<Header text={`Edit Category: ${category.name}`} />
					<Link href={`/${locale}/admin/product-categories`}>
						<Button variant="outline">Back to Categories</Button>
					</Link>
				</div>

				{/* You'll need to create this component */}
				<CategoryEditForm category={category} locale={locale} />
			</div>
		);
	} catch (error) {
		console.error("Error fetching category:", error);
		return (
			<div className="flex flex-col">
				<Header text="Category Details" />
				<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mt-4">
					<p className="text-red-500">Failed to load category details</p>
					<Link
						href={`/${locale}/admin/product-categories`}
						className="mt-4 inline-block"
					>
						<Button variant="outline">Back to Categories</Button>
					</Link>
				</div>
			</div>
		);
	}
}
