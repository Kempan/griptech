// client/src/app/lib/utils/get-session.ts
import { cookies } from "next/headers";

export async function getSession() {
	const cookieStore = await cookies();
	return cookieStore.get("session")?.value;
}