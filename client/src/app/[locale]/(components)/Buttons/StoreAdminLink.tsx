// app/[locale]/(components)/Buttons/StoreAdminLink.tsx
import { ShoppingBasket, Store } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getAuthContext } from "@/app/lib/utils/auth-utils";

/**
 * Server component that renders either the store or admin link
 * based on the current path and admin status
 */
interface StoreAdminLinkProps {
	isAdminPath: boolean;
}

const StoreAdminLink = async ({ isAdminPath }: StoreAdminLinkProps) => {
	// Get auth data from server
	const auth = await getAuthContext();

	// If we're on admin path, show link to store
	if (isAdminPath) {
		return (
			<Link href="/">
				<ShoppingBasket
					className="cursor-pointer text-gray-500"
					size={24}
					strokeWidth={1.4}
				/>
			</Link>
		);
	}

	// If we're on store path and user is admin, show link to admin
	if (!isAdminPath && auth.isLoggedIn && auth.user?.roles?.includes("admin")) {
		return (
			<Link href="/admin">
				<Store
					className="cursor-pointer text-gray-500"
					size={24}
					strokeWidth={1.4}
				/>
			</Link>
		);
	}

	// Otherwise, return null (no admin access)
	return null;
};

export default StoreAdminLink;
