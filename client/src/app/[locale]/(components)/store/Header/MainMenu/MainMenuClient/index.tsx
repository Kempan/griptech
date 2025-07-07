"use client";

import React from "react";
import { cn } from "@/shadcn/lib/utils";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/shadcn/components/ui/navigation-menu";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ProductCategory } from "@/app/types";

type ParentCategory = {
	id: string;
	name: string;
	slug: string;
	children: ChildCategory[];
};

type ChildCategory = {
	id: string;
	name: string;
	slug: string;
};

interface MainMenuProps {
	categories: ProductCategory[];
}

export default function MainMenuClient({ categories }: MainMenuProps) {
	const t = useTranslations();

	return (
		<NavigationMenu>
			<NavigationMenuList>
				{/* Single Categories dropdown */}
				<NavigationMenuItem>
					<NavigationMenuTrigger>{t("Categories")}</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid gap-3 p-4 md:w-[400px] lg:w-[800px] lg:grid-cols-3">
							{categories
								.filter((cat) => cat.id !== null) // Filter out null ids
								.map((parentCategory) => (
									<ListItem
										key={parentCategory.id!}
										title={parentCategory.name}
										href={{
											pathname: "/product-category/[slug]",
											params: { slug: parentCategory.slug },
										}}
									>
										{parentCategory.children &&
										parentCategory.children.length > 0
											? `Explore ${
													parentCategory.children.length
											  } subcategories including ${parentCategory.children
													.slice(0, 2)
													.map((c) => c.name)
													.join(", ")}${
													parentCategory.children.length > 2
														? " and more."
														: "."
											  }`
											: `Browse all ${parentCategory.name} products.`}
									</ListItem>
								))}
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>

				{/* Additional Menu Items */}
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<Link href="/contact" className={navigationMenuTriggerStyle()}>
							{t("Contact")}
						</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<Link href="/terms" className={navigationMenuTriggerStyle()}>
							{t("Terms")}
						</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<Link href="/faq" className={navigationMenuTriggerStyle()}>
							FAQ
						</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}

const ListItem = React.forwardRef<
	React.ComponentRef<typeof Link>,
	React.ComponentPropsWithoutRef<typeof Link> & {
		title: string;
		children: React.ReactNode;
	}
>(({ className, title, children, href, ...props }, ref) => {
	return (
		<li>
			<NavigationMenuLink asChild>
				<Link
					ref={ref}
					href={href}
					className={cn(
						"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
						className
					)}
					{...props}
				>
					<div className="text-sm font-medium leading-none">{title}</div>
					<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{children}
					</p>
				</Link>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";
