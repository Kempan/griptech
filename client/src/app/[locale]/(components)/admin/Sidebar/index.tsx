"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/app/state";
import {
	Archive,
	CircleDollarSign,
	Clipboard,
	Layout,
	LucideIcon,
	Menu,
	SlidersHorizontal,
	User,
	ListOrdered,
	PackageOpen,
	RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useTranslations } from "next-intl";

interface SidebarLinkProps {
	href: string;
	icon: LucideIcon;
	label: string;
	isCollapsed: boolean;
}

const SidebarLink = ({
	href,
	icon: Icon,
	label,
	isCollapsed,
}: SidebarLinkProps) => {
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<Link href={href}>
			<div
				className={`cursor-pointer flex items-center ${
					isCollapsed ? "justify-center py-4" : "justify-start px-4 py-4"
				}
        hover:text-gray-800 hover:bg-gray-100 gap-3 transition-colors ${
					isActive ? "bg-gray-100 text-gray-800" : ""
				}
      }`}
			>
				<Icon className="w-6 h-6" />

				<span
					className={`${
						isCollapsed ? "hidden" : "block"
					} font-medium`}
				>
					{label}
				</span>
			</div>
		</Link>
	);
};

const Sidebar = () => {
	const dispatch = useAppDispatch();
	const isSidebarCollapsed = useAppSelector(
		(state) => state.global.isSidebarCollapsed
	);

	const toggleSidebar = () => {
		dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
	};

	const sidebarClassNames = `fixed flex flex-col ${
		isSidebarCollapsed ? "w-0 lg:w-16" : "w-72 lg:w-64"
	} bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

	const t = useTranslations();

	return (
		<aside className={sidebarClassNames}>
			<div
				className={`flex justify-between lg:justify-normal items-center pt-6 ${
					isSidebarCollapsed ? "px-5" : "px-8"
				}`}
			>
				<Link href="/admin">
					{isSidebarCollapsed ? (
						<Image
							src="/images/griptech-logo.webp"
							alt="logotype-small"
							width={40}
							height={40}
							className="rounded"
						/>
					) : (
						<Image
							src="/images/griptech-logo.webp"
							alt="logotype"
							width={80}
							height={60}
							className="rounded"
						/>
					)}
				</Link>
				<button
					className="lg:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-green-100"
					onClick={toggleSidebar}
				>
					<Menu className="w-4 h-4" />
				</button>
			</div>

			{/* LINKS */}
			<div className="grow mt-8">
				<SidebarLink
					href="/admin"
					icon={Layout}
					label={t("Dashboard")}
					isCollapsed={isSidebarCollapsed}
				/>
				<SidebarLink
					href="/admin/product-categories"
					icon={ListOrdered}
					label={t("Categories")}
					isCollapsed={isSidebarCollapsed}
				/>
				<SidebarLink
					href="/admin/products"
					icon={Clipboard}
					label={t("Products")}
					isCollapsed={isSidebarCollapsed}
				/>
				<SidebarLink
					href="/admin/orders"
					icon={PackageOpen}
					label={t("Orders")}
					isCollapsed={isSidebarCollapsed}
				/>
				<SidebarLink
					href="/admin/users"
					icon={User}
					label={t("Users")}
					isCollapsed={isSidebarCollapsed}
				/>
				<SidebarLink
					href="/admin/settings"
					icon={SlidersHorizontal}
					label={t("Settings")}
					isCollapsed={isSidebarCollapsed}
				/>
			</div>

			{/* FOOTER */}
			<div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
				<p className="text-center text-xs text-gray-500">&copy; 2025 Griptech</p>
			</div>
		</aside>
	);
};

export default Sidebar;
