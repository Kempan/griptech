"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useGetAuthStatusQuery } from "@/app/state/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminTestPage() {
	const { isLoggedIn, isAdmin, isLoading } = useAuth();
	const { data, isLoading: queryLoading, error } = useGetAuthStatusQuery();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading) {
			if (!isLoggedIn) {
				console.log("🔴 Not logged in, redirecting to login");
				router.push("/login");
			} else if (!isAdmin) {
				console.log("🔴 Not admin, redirecting to home");
				router.push("/");
			} else {
				console.log("🟢 Admin access granted!");
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
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Access Denied</h1>
					<p>You need to be logged in as an admin to access this page.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">Admin Test Page (Bypassing Middleware)</h1>
			
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-green-100 p-6 rounded-lg">
					<h2 className="text-xl font-semibold mb-4 text-green-800">✅ Authentication Status</h2>
					<pre className="text-sm bg-white p-4 rounded">
						{JSON.stringify({
							isLoggedIn,
							isAdmin,
							isLoading,
							userId: data?.userId,
							roles: data?.roles
						}, null, 2)}
					</pre>
				</div>

				<div className="bg-blue-100 p-6 rounded-lg">
					<h2 className="text-xl font-semibold mb-4 text-blue-800">🔧 API Query State</h2>
					<pre className="text-sm bg-white p-4 rounded">
						{JSON.stringify({
							data,
							isLoading: queryLoading,
							error: error ? {
								status: 'status' in error ? error.status : 'unknown',
								data: 'data' in error ? error.data : 'unknown'
							} : null
						}, null, 2)}
					</pre>
				</div>
			</div>

			<div className="mt-8 bg-yellow-100 p-6 rounded-lg">
				<h2 className="text-xl font-semibold mb-4 text-yellow-800">🎯 Test Results</h2>
				<p className="mb-4">
					If you can see this page, it means:
				</p>
				<ul className="list-disc list-inside space-y-2">
					<li>✅ Authentication is working correctly</li>
					<li>✅ Admin role is properly assigned</li>
					<li>✅ Client-side auth checks are working</li>
					<li>❌ The issue is with the middleware or routing</li>
				</ul>
			</div>

			<div className="mt-8">
				<a 
					href="/admin" 
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				>
					Try Regular Admin Page
				</a>
			</div>
		</div>
	);
} 