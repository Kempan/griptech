"use client";

import { useState, useEffect } from "react";

interface Category {
	id: string;
	name: string;
	children?: Category[];
}

interface Product {
	id: string;
	name: string;
	categories: Category[];
}

interface CategorySelectorProps {
	categories: Category[];
	product: Product;
}

/** 🔹 Recursive function to render categories with indentation */
const renderCategories = (
	categories: Category[],
	selectedCategories: string[],
	handleCategoryChange: (categoryId: string) => void,
	level = 0
) => {
	return categories.map((category) => (
		<div
			key={category.id}
			style={{ marginLeft: level > 0 ? `${7 * level}px` : "0px" }}
		>
			<label className="flex items-center space-x-2">
				<span>{"-".repeat(level)}</span>
				<input
					type="checkbox"
					checked={selectedCategories.includes(category.id)}
					onChange={() => handleCategoryChange(category.id)}
					className="w-4 h-4"
					style={level === 0 ? { marginLeft: "0px" } : undefined}
				/>
				<span className="text-gray-700">{category.name}</span>
			</label>
			{/* Recursive call for child categories */}
			{category.children && category.children.length > 0 && (
				<div>
					{renderCategories(
						category.children,
						selectedCategories,
						handleCategoryChange,
						level + 1
					)}
				</div>
			)}
		</div>
	));
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
	categories,
	product,
}) => {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

	// ✅ Populate selected categories when product is loaded
	useEffect(() => {
		if (product?.categories) {
			setSelectedCategories(product.categories.map((cat) => cat.id));
		}
	}, [product]);

	/** ✅ Handle category selection */
	const handleCategoryChange = (categoryId: string) => {
		setSelectedCategories((prev) =>
			prev.includes(categoryId)
				? prev.filter((id) => id !== categoryId)
				: [...prev, categoryId]
		);
	};

	/** ✅ Handle save */
	const handleSave = async () => {
		try {
			// Implement a function to update categories in the database via API
			console.log("Updating categories:", selectedCategories);
			alert("Product categories updated successfully!");
		} catch (error) {
			alert("Failed to update product categories.");
		}
	};

	return (
		<div className="flex flex-col w-fit bg-white shadow-sm rounded p-4 border border-gray-200">
			<h3 className="text-md font-semibold text-gray-900 mb-2">Categories</h3>
			{categories.length > 0 ? (
				<div className="grid gap-2">
					{renderCategories(
						categories,
						selectedCategories,
						handleCategoryChange
					)}
				</div>
			) : (
				<p className="text-gray-500">No categories found</p>
			)}
			<button
				onClick={handleSave}
				className="mt-3 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded"
			>
				Save Changes
			</button>
		</div>
	);
};

export default CategorySelector;
