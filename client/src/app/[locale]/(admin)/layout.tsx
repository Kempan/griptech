"use client";

import Navbar from "@/app/[locale]/(components)/admin/Navbar";
import Sidebar from "@/app/[locale]/(components)/admin/Sidebar";
import { useAppSelector } from "@/app/redux";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {

	const isSidebarCollapsed = useAppSelector(
		(state) => state.global.isSidebarCollapsed
	);
	
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
