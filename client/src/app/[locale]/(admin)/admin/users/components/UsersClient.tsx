// client/src/app/[locale]/(admin)/admin/users/UsersClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { User } from "@/app/types";
import CreateUser from "./CreateUser";
import UserTable from "./UserTable";
import SearchBar from "@/app/[locale]/(components)/SearchBar";
import { useTranslations } from "next-intl";

interface UsersClientProps {
	initialUsers: User[];
	totalCount: number;
	currentPage: number;
	pageSize: number;
}

export default function UsersClient({
	initialUsers,
	totalCount,
	currentPage,
	pageSize,
}: UsersClientProps) {
	const [users, setUsers] = useState<User[]>(initialUsers);
	const searchParams = useSearchParams();
	const t = useTranslations();
	
	// Update users when initialUsers or searchParams change
	useEffect(() => {
		setUsers(initialUsers);
	}, [initialUsers, searchParams]);

	// Handle new user creation
	const handleUserCreated = (newUser: User) => {
		setUsers((prevUsers) => [...prevUsers, newUser]);
		console.log(`✅ New user added: ${newUser.name}`);
	};

	return (
		<div className="flex flex-col gap-4">
			<CreateUser onUserCreated={handleUserCreated} />
			<SearchBar placeholder={t("search")} />
			<UserTable users={users} totalCount={totalCount} pageSize={pageSize} />
		</div>
	);
}
