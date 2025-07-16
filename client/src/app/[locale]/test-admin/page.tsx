"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useGetAuthStatusQuery } from "@/app/state/api";

export default function TestAdminPage() {
	const { isLoggedIn, isAdmin, isLoading, userId, roles } = useAuth();
	const { data, isLoading: queryLoading, error } = useGetAuthStatusQuery();

	return (
		<div className="p-8 max-w-2xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">Admin Authentication Test</h1>
			
			<div className="space-y-4">
				<div className="bg-gray-100 p-4 rounded">
					<h2 className="font-semibold mb-2">AuthContext State:</h2>
					<pre className="text-sm">
						{JSON.stringify({
							isLoggedIn,
							isAdmin,
							isLoading,
							userId,
							roles
						}, null, 2)}
					</pre>
				</div>

				<div className="bg-gray-100 p-4 rounded">
					<h2 className="font-semibold mb-2">API Query State:</h2>
					<pre className="text-sm">
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

				<div className="bg-gray-100 p-4 rounded">
					<h2 className="font-semibold mb-2">Cookies:</h2>
					<pre className="text-sm">
						{typeof document !== 'undefined' ? document.cookie : 'Server side - no cookies'}
					</pre>
				</div>

				<div className="bg-gray-100 p-4 rounded">
					<h2 className="font-semibold mb-2">Current URL:</h2>
					<pre className="text-sm">
						{typeof window !== 'undefined' ? window.location.href : 'Server side'}
					</pre>
				</div>
			</div>
		</div>
	);
} 