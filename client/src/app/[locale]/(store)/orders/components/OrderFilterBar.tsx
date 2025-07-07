"use client";

// client/src/app/[locale]/(store)/orders/components/OrderFilterBar.tsx
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { OrderStatus } from "@/app/types";
import { Input } from "@/shadcn/components/ui/input";
import { Button } from "@/shadcn/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shadcn/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { useTranslations } from "next-intl";

interface OrderFilterBarProps {
	initialStatus?: OrderStatus;
	initialSearch?: string;
}

export default function OrderFilterBar({
	initialStatus,
	initialSearch,
}: OrderFilterBarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const t = useTranslations();
	
	// Initialize state from URL parameters for consistent UI
	const [status, setStatus] = useState<OrderStatus | "ALL">(
		initialStatus || (searchParams.get("status") as OrderStatus) || "ALL"
	);
	const [search, setSearch] = useState(
		initialSearch || searchParams.get("search") || ""
	);

	// Create query string from filter params
	const createQueryString = (params: Record<string, string | undefined>) => {
		const newSearchParams = new URLSearchParams();

		// First, copy all existing parameters except the ones we'll override
		searchParams.forEach((value, key) => {
			if (key !== "page" && key !== "status" && key !== "search") {
				newSearchParams.append(key, value);
			}
		});

		// Then add or override with our filter parameters
		Object.entries(params).forEach(([key, value]) => {
			if (value) {
				newSearchParams.set(key, value);
			}
		});

		return newSearchParams.toString();
	};

	// Handle search input change - only updates local state
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
	};

	// Handle status change - only updates local state
	const handleStatusChange = (value: OrderStatus | "ALL") => {
		setStatus(value);
	};

	// Handle applying the filters when the search button is clicked
	const handleApplyFilters = () => {
		// Create query parameters
		const queryParams = {
			status: status !== "ALL" ? status : undefined,
			search: search.trim() || undefined,
			page: "1", // Reset to first page on filter change
		};

		// Build the query string
		const query = createQueryString(queryParams);

		// Navigate with the filters
		router.push(`${pathname}${query ? `?${query}` : ""}`);
	};

	// Handle clearing filters
	const handleClearFilters = () => {
		setStatus("ALL");
		setSearch("");
		router.push(pathname);
	};

	// Handle when Enter key is pressed in search field
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleApplyFilters();
		}
	};

	return (
		<div className="mb-6 mt-6">
			<div className="flex flex-col md:flex-row gap-4 items-end">
				<div className="w-full md:w-1/2">
					<label
						htmlFor="search"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						{t("searchOrders")}
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-4 w-4 text-gray-400" />
						</div>
						<Input
							id="search"
							type="text"
							placeholder={t("searchOrdersPlaceholder")}
							value={search}
							onChange={handleSearchChange}
							onKeyDown={handleKeyDown}
							className="pl-10"
						/>
					</div>
				</div>

				<div className="w-full md:w-1/4">
					<label
						htmlFor="status-filter"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						{t("status")}
					</label>
					<Select
						value={status}
						onValueChange={(value) =>
							handleStatusChange(value as OrderStatus | "ALL")
						}
					>
						<SelectTrigger id="status-filter">
							<SelectValue placeholder={t("filterByStatus")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">{t("allStatuses")}</SelectItem>
							<SelectItem value="PENDING">{t("pending")}</SelectItem>
							<SelectItem value="PROCESSING">{t("processing")}</SelectItem>
							<SelectItem value="ON_HOLD">{t("onHold")}</SelectItem>
							<SelectItem value="COMPLETED">{t("completed")}</SelectItem>
							<SelectItem value="CANCELLED">{t("cancelled")}</SelectItem>
							<SelectItem value="REFUNDED">{t("refunded")}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex md:flex-row gap-2">
					<Button
						onClick={handleApplyFilters}
						className="flex items-center gap-1"
					>
						<Filter className="h-4 w-4" />
						{t("applyFilters")}
					</Button>

					{(search || status !== "ALL") && (
						<Button
							variant="outline"
							onClick={handleClearFilters}
							className="flex items-center gap-1"
						>
							<X className="h-4 w-4" />
							{t("clearFilters")}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
