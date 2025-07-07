"use client";

import * as React from "react";
import { NavMain } from "@/shadcn/components/nav-main";
import { NavProjects } from "@/shadcn/components/nav-projects";
import {
	Sidebar,
	SidebarContent,
	SidebarRail,
} from "@/shadcn/components/ui/sidebar";

// ✅ Utility to find the top parent category
const findTopParent = (category: any): any => {
	let currentCategory = category;
	while (currentCategory?.parent) {
		currentCategory = currentCategory.parent;
	}
	return currentCategory;
};

// Revised buildCategoryTree function that preserves the children structure correctly
const buildCategoryTree = (categories: any[], activeCategorySlug?: string) => {
	// Filter top-level categories
	const topLevelCategories = categories.filter((cat) => !cat.parentId);

	return topLevelCategories.map((category) => {
		// Check if this category or any of its children is active
		const isThisCategoryActive = category.slug === activeCategorySlug;

		// Process children if they exist
		let processedChildren;
		if (category.children && category.children.length > 0) {
			processedChildren = category.children.map((child: any) => {
				const isChildActive = child.slug === activeCategorySlug;
				return {
					title: child.name,
					url: `/product-category/${child.slug}`,
					isActive: isChildActive,
				};
			});
		}

		// Check if any child is active
		const isAnyChildActive =
			processedChildren?.some((child: any) => child.isActive) || false;

		return {
			title: category.name,
			url: `/product-category/${category.slug}`,
			isActive: isThisCategoryActive || isAnyChildActive,
			// Only include children if there are any
			children: processedChildren,
		};
	});
};

// ✅ No more client-side fetching
export function AppSidebar({
	topLevelCategoryData,
	activeCategorySlug,
	allCategories,
	...props
}: {
	topLevelCategoryData: any;
	activeCategorySlug?: string;
	allCategories: any[];
}) {

	const categoryNavItems = allCategories
		? buildCategoryTree(allCategories, activeCategorySlug)
		: [];

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarContent>
				{categoryNavItems.length > 0 ? (
					<NavMain items={categoryNavItems} />
				) : (
					<p className="p-4 text-gray-500">No categories found</p>
				)}
				{/* <NavProjects projects={[]} /> */}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
