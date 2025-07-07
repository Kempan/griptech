"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/app/state";
import {
	Bell,
	Menu,
	Settings,
	ShoppingBasket,
	Store,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import ThemeToggle from "@/app/[locale]/(components)/ThemeToggle";
import LanguageSwitcher from "@/app/[locale]/(components)/LanguageSwitcher";
import UserDropdownMenu from "@/app/[locale]/(components)/UserDropdownMenu";


const Navbar = () => {
	const dispatch = useAppDispatch();
	const isSidebarCollapsed = useAppSelector(
		(state) => state.global.isSidebarCollapsed
	);

	const toggleSidebar = () => {
		dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
	};

	const pathname = usePathname();

	// Extract the possible locale prefix (if any)
	const localeRegex = /^\/(en|fr|de|nl|it|es|fi|dk|pl)(\/|$)/;
	const normalizedPathname = pathname.replace(localeRegex, "/");

	// Determine layout type based on normalized pathname
	const isAdmin = normalizedPathname.startsWith("/admin");

	return (
		<header className="flex justify-between items-center w-full p-6">
			{/* LEFT SIDE */}
			<div className="flex justify-between items-center gap-5">
				<button
					className="px-3 py-3 bg-gray-100 rounded-full hover:bg-green-100"
					onClick={toggleSidebar}
				>
					<Menu className="w-4 h-4" />
				</button>
			</div>

			{/* RIGHT SIDE */}
			<div className="flex justify-between items-center gap-5">
				<div className="hidden md:flex items-center gap-5">
					<UserDropdownMenu />
					<div>
						{isAdmin ? (
							<Link href="/">
								<ShoppingBasket
									className="cursor-pointer text-gray-500"
									size={24}
									strokeWidth={1.4}
								/>
							</Link>
						) : (
							<Link href="/admin">
								<Store
									className="cursor-pointer text-gray-500"
									size={24}
									strokeWidth={1.4}
								/>
							</Link>
						)}
					</div>
					<div className="relative">
						<Bell
							className="cursor-pointer text-gray-500"
							size={24}
							strokeWidth={1.4}
						/>
						<span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
							3
						</span>
					</div>

					<ThemeToggle />
					<div className="flex items-center flex-col">
						<LanguageSwitcher />
					</div>
					<hr className="w-0 h-7 border border-solid border-l border-gray-300" />
					<div className="flex items-center gap-3 cursor-pointer">
						<Image
							src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_PREFIX}/logo-small.png`}
							alt="Profile"
							width={30}
							height={30}
							className="h-full object-cover"
						/>
					</div>
				</div>
				<Link href="/admin/settings">
					<Settings className="cursor-pointer text-gray-500" size={24} />
				</Link>
			</div>
		</header>
	);
};

export default Navbar;
