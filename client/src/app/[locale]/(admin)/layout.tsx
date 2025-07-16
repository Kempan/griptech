"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/[locale]/(components)/admin/Navbar";
import Sidebar from "@/app/[locale]/(components)/admin/Sidebar";
import { useAppSelector } from "@/app/redux";
import { useAuth } from "@/app/context/AuthContext";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter();
	const { isLoggedIn, isAdmin, isLoading } = useAuth();
	const isSidebarCollapsed = useAppSelector(
		(state) => state.global.isSidebarCollapsed
	);

	useEffect(() => {
		if (!isLoading) {
			if (!isLoggedIn) {
				router.push("/login");
			} else if (!isAdmin) {
				router.push("/");
			}
		}
	}, [isLoggedIn, isAdmin, isLoading, router]);

	// Show loading while checking authentication
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	// Don't render admin content if not authenticated or not admin
	if (!isLoggedIn || !isAdmin) {
		return null;
	}
	
	return (
		<div
			// className={`${
			// 	isDarkMode ? "dark" : "light"
			// } flex bg-gray-50 text-gray-900 w-full min-h-screen`}
			className="flex bg-gray-50 text-gray-900 w-full min-h-screen"
		>
			<Sidebar />
			<main
				className={`flex flex-col w-full h-full bg-gray-50 ${
					isSidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
				}`}
			>
				<Navbar />
				<div className="flex flex-col w-full h-full px-6 pb-6 bg-gray-50">
					{children}
				</div>
			</main>
		</div>
	);
};

export default AdminLayout;
