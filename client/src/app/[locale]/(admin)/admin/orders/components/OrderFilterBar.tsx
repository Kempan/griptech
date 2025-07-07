// client/src/app/[locale]/(admin)/admin/orders/components/OrderFilterBar.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import { Search, X, PlusCircle } from "lucide-react";
import { debounce } from "lodash";
import CreateOrderModal from "./CreateOrderModal";
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
  const t = useTranslations();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [status, setStatus] = useState<OrderStatus | "ALL">(
    initialStatus || "ALL"
  );
  const [search, setSearch] = useState(initialSearch || "");

  // Create query string from filter params
  const createQueryString = (params: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      }
    });

    return newSearchParams.toString();
  };

  // Debounced search function
  const debouncedSearch = debounce((value: string) => {
    const query = createQueryString({
      status: status !== "ALL" ? status : undefined,
      search: value || undefined,
      page: "1", // Reset to first page on search
    });

    router.push(`${pathname}?${query}`);
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (value: OrderStatus | "ALL") => {
    setStatus(value);

    const query = createQueryString({
      status: value !== "ALL" ? value : undefined,
      search: search || undefined,
      page: "1", // Reset to first page on filter change
    });

    router.push(`${pathname}?${query}`);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setStatus("ALL");
    setSearch("");
    router.push(pathname);
  };

  // Handle order creation
  const handleOrderCreated = () => {
    // Refresh the page to show new order
    router.refresh();
    setIsCreateModalOpen(false);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
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
              <SelectItem value="FAILED">{t("failed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
        
        <div className="ml-auto">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {t("createOrder")}  
          </Button>
        </div>
      </div>
      
      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleOrderCreated}
      />
    </div>
  );
}