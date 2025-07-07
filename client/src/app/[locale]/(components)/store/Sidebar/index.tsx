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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

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
					isCollapsed ? "justify-center py-4" : "justify-start p-4"
				}
        hover:text-gray-800 hover:bg-gray-100 gap-3 transition-colors ${
					isActive ? "bg-gray-100 text-gray-800" : ""
				}
      }`}
			>
				<Icon className="w-6 h-6 text-gray-700!" />

				<span
					className={`${
						isCollapsed ? "hidden" : "block"
					} font-medium text-gray-700`}
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
	} transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

	return (
		<div className={sidebarClassNames}>
			<div
				className={`flex items-center justify-between h-[77px] ${
					isSidebarCollapsed ? "px-5" : "px-4"
				}`}
			>
				<Link href="/">
					{isSidebarCollapsed ? (
						<Image
							src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_PREFIX}/logo-small.png`}
							alt="logotype-small"
							width={40}
							height={40}
							className="rounded w-full"
						/>
					) : (
						<Image
							src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_PREFIX}/logo.png`}
							alt="logotype"
							width={100}
							height={80}
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
			<div className="grow">
				<SidebarLink
					href="/admin"
					icon={Layout}
					label="Dashboard"
					isCollapsed={isSidebarCollapsed}
				/>
				<SidebarLink
					href="/admin/products"
					icon={Clipboard}
					label="Products"
					isCollapsed={isSidebarCollapsed}
				/>
				<SidebarLink
					href="/admin/users"
					icon={User}
					label="Users"
					isCollapsed={isSidebarCollapsed}
				/>
				<SidebarLink
					href="/admin/settings"
					icon={SlidersHorizontal}
					label="Settings"
					isCollapsed={isSidebarCollapsed}
				/>
				<SidebarLink
					href="/admin/expenses"
					icon={CircleDollarSign}
					label="Expenses"
					isCollapsed={isSidebarCollapsed}
				/>
			</div>

			{/* FOOTER */}
			<div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
				<p className="text-center text-xs text-gray-500">&copy; 2025 Griptech</p>
			</div>
		</div>
	);
};

export default Sidebar;
