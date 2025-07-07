import { getUsers } from "@/app/actions/admin/userActions";
import { ServerHeader } from "@/app/[locale]/(components)/Header/ServerHeader";
import UsersClient from "./components/UsersClient";
import { User } from "@/app/types";
import { getTranslations } from "next-intl/server";

// Filter users by search term
function filterUsers(users: User[], search: string): User[] {
	if (!search) return users;

	const searchLower = search.toLowerCase();
	return users.filter(
		(user) =>
			user.name.toLowerCase().includes(searchLower) ||
			user.email.toLowerCase().includes(searchLower) ||
			String(user.id).includes(searchLower) ||
			user.roles?.some((role) => role.toLowerCase().includes(searchLower))
	);
}

interface UsersPageProps {
	searchParams: Promise<{
		search?: string;
		page?: number;
	}>;
}

export default async function Users({ searchParams }: UsersPageProps) {
	const { search, page } = await searchParams;
	const t = await getTranslations();
	// Extract search parameters
	const searchTerm = search || "";
	const currentPage = Number(page) || 1;
	const pageSize = 5;

	// Fetch all users
	const users = await getUsers();

	// Filter by search term
	const filteredUsers = filterUsers(users, searchTerm);

	// Calculate pagination
	const totalCount = filteredUsers.length;
	const startIndex = (currentPage - 1) * pageSize;
	const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

	return (
		<div className="mx-auto pb-4 w-full">
			<ServerHeader text={t("users")} />
			<UsersClient
				initialUsers={paginatedUsers}
				totalCount={totalCount}
				currentPage={currentPage}
				pageSize={pageSize}
			/>
		</div>
	);
}
