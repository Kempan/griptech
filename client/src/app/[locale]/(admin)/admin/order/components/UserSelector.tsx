"use client";

// client/src/app/[locale]/(admin)/admin/order/components/UserSelector.tsx
import { useState, useEffect, useRef } from "react";
import {
	searchUsers,
	connectOrderToUser,
} from "@/app/actions/admin/userActions";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface User {
	id: number;
	name: string;
	email: string;
}

interface UserSelectorProps {
	orderId: number;
	currentUserId?: number | null;
	currentUserName?: string | null;
	currentUserEmail?: string | null;
}

export default function UserSelector({
	orderId,
	currentUserId,
	currentUserName,
	currentUserEmail,
}: UserSelectorProps) {
	const router = useRouter();
	const [users, setUsers] = useState<User[]>([]);
	const [search, setSearch] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<number | null>(
		currentUserId || null
	);
	const [selectedUserName, setSelectedUserName] = useState<string | null>(
		currentUserName || null
	);
	const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(
		currentUserEmail || null
	);
	const [isSearching, setIsSearching] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const t = useTranslations();
	// Handle clicks outside of the dropdown to close it
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setShowDropdown(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// When the search term changes, fetch users
	useEffect(() => {
		const delaySearch = setTimeout(async () => {
			if (search && search.length >= 2) {
				setIsSearching(true);
				try {
					const foundUsers = await searchUsers(search);
					// Ensure IDs are converted to numbers if they come as strings
					const parsedUsers = foundUsers.map((user) => ({
						...user,
						id: typeof user.id === "string" ? parseInt(user.id) : user.id,
					}));
					setUsers(parsedUsers);
					setShowDropdown(true);
				} catch (error) {
					console.error("Error searching users:", error);
					toast.error("Failed to search users");
				} finally {
					setIsSearching(false);
				}
			} else {
				setUsers([]);
				setShowDropdown(false);
			}
		}, 400);

		return () => clearTimeout(delaySearch);
	}, [search]);

	const handleUserSelect = (user: User) => {
		setSelectedUserId(user.id);
		setSelectedUserName(user.name);
		setSelectedUserEmail(user.email);
		setSearch("");
		setShowDropdown(false);
	};

	const handleConnect = async () => {
		if (!selectedUserId) {
			toast.error("Please select a user");
			return;
		}

		setIsConnecting(true);
		try {
			await connectOrderToUser(orderId, selectedUserId);
			toast.success("Order connected to user successfully");
			router.refresh(); // Refresh the page to show updated data
		} catch (error) {
			console.error("Error connecting order to user:", error);
			toast.error("Failed to connect order to user");
		} finally {
			setIsConnecting(false);
		}
	};

	const handleDisconnect = async () => {
		if (!currentUserId) return;

		if (
			!confirm("Are you sure you want to disconnect this user from the order?")
		) {
			return;
		}

		setIsConnecting(true);
		try {
			await connectOrderToUser(orderId, null);
			toast.success("User disconnected from order");
			setSelectedUserId(null);
			setSelectedUserName(null);
			setSelectedUserEmail(null);
			router.refresh(); // Refresh the page to show updated data
		} catch (error) {
			console.error("Error disconnecting user from order:", error);
			toast.error("Failed to disconnect user");
		} finally {
			setIsConnecting(false);
		}
	};

	return (
		<div className="space-y-4">
			<h3 className="font-medium text-gray-700 mb-2">{t("connectedUser")}</h3>

			{currentUserId && (
				<div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4">
					<div className="font-medium">{currentUserName}</div>
					<div className="text-gray-600 text-sm">{currentUserEmail}</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleDisconnect}
						disabled={isConnecting}
						className="mt-2"
					>
						{t("disconnectUser")}
					</Button>
				</div>
			)}

			<div ref={dropdownRef} className="relative">
				<Input
					placeholder={t("searchUsersByEmailOrName")}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					onFocus={() => search.length >= 2 && setShowDropdown(true)}
				/>

				{showDropdown && (
					<div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
						{isSearching ? (
							<div className="p-2 text-center text-gray-500">
								{t("searching")}
							</div>
						) : users.length > 0 ? (
							users.map((user) => (
								<div
									key={user.id}
									className="p-2 hover:bg-gray-100 cursor-pointer"
									onClick={() => handleUserSelect(user)}
								>
									<div className="font-medium">{user.name}</div>
									<div className="text-sm text-gray-600">{user.email}</div>
								</div>
							))
						) : (
							<div className="p-2 text-center text-gray-500">
								{t("noUsersFound")}
							</div>
						)}
					</div>
				)}

				{selectedUserId && selectedUserId !== currentUserId && (
					<div className="mt-2 p-2 bg-gray-100 border border-gray-200 rounded">
						<div className="font-medium">{selectedUserName}</div>
						<div className="text-sm text-gray-600">{selectedUserEmail}</div>
					</div>
				)}

				<Button
					onClick={handleConnect}
					disabled={
						!selectedUserId || isConnecting || selectedUserId === currentUserId
					}
					className="w-full mt-2"
				>
					{isConnecting ? t("connecting") : t("connectUser")}
				</Button>
			</div>
		</div>
	);
}
