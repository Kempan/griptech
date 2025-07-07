// client/src/app/actions/AuthActions.ts

import { cookies } from "next/headers";
import { AuthStatus } from "@/app/types";

/**
 * Get the current authentication status from the server
 * This replaces client-side auth checking with RTK
 */
export async function getAuthStatus(): Promise<AuthStatus> {
  try {
    // Get the session cookie from the request
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    
    if (!sessionCookie) {
      return { isLoggedIn: false };
    }

    // Make a server-to-server request to validate the session
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/session`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `session=${sessionCookie}`
        },
        cache: "no-store", // Ensure we don't cache auth status
      }
    );
    
    if (!response.ok) {
      return { isLoggedIn: false };
    }

    const data = await response.json();
    
    // Return the auth status
    return {
      isLoggedIn: data.isLoggedIn || false,
      userId: data.userId,
      name: data.name,
      email: data.email,
      roles: data.roles
    };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { isLoggedIn: false };
  }
}