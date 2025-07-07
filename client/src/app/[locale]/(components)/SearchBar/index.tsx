// client/src/app/components/admin/SearchBar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/shadcn/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchBarProps {
	placeholder?: string;
	debounceTime?: number;
	className?: string;
}

export default function SearchBar({
	placeholder = "Search...",
	debounceTime = 500,
	className = "",
}: SearchBarProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchTerm, setSearchTerm] = useState(
		searchParams.get("search") || ""
	);

	// Update URL when typing with debounce
	useEffect(() => {
		const debounceTimeout = setTimeout(() => {
			const params = new URLSearchParams(searchParams.toString());
			if (searchTerm) {
				params.set("search", searchTerm);
				// Reset to page 1 when searching
				params.set("page", "1");
			} else {
				params.delete("search");
			}
			router.push(`?${params.toString()}`);
		}, debounceTime);

		return () => clearTimeout(debounceTimeout);
	}, [searchTerm, router, searchParams, debounceTime]);

	return (
		<div className={`relative bg-white flex items-center w-full ${className}`}>
			<SearchIcon className="absolute left-3 w-5 h-5 text-gray-500" />
			<Input
				className="pl-10 w-full"
				placeholder={placeholder}
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
		</div>
	);
}