"use client";

import { usePathname } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { Heart, Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shadcn/lib/utils";

interface NavigationLinkProps {
	href: string;
	isActive: boolean;
	icon: React.ReactNode;
	label: string;
}

function NavigationLink({ href, isActive, icon, label }: NavigationLinkProps) {
	return (
		<Link
			href={href as any}
			className={cn(
				"flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				isActive
					? "bg-background text-foreground shadow-sm"
					: "text-muted-foreground hover:text-foreground"
			)}
		>
			{icon}
			{label}
		</Link>
	);
}

export default function FavoritesTabContent() {
	const t = useTranslations();
	const pathname = usePathname();

	// Determine active tab based on current route
	// Handle both localized and non-localized paths
	const isOnFavorites =
		pathname.includes("/favorit") && !pathname.includes("paket");
	const isOnBundles =
		pathname.includes("/favorite-bundles") ||
		pathname.includes("/produktpaket");

	return (
		<div className="w-full">
			<div className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full mb-6">
				<NavigationLink
					href="/favorites"
					isActive={isOnFavorites}
					icon={<Heart className="w-4 h-4 mr-2" />}
					label={t("FavoriteProducts")}
				/>
				<NavigationLink
					href="/favorite-bundles"
					isActive={isOnBundles}
					icon={<Package className="w-4 h-4 mr-2" />}
					label={t("ProductBundles")}
				/>
			</div>
		</div>
	);
}
