// client/src/app/types/auth.ts

/**
 * AuthStatus type definition
 */
export interface AuthStatus {
	isLoggedIn: boolean;
	userId?: number;
	name?: string;
	email?: string;
	roles?: string[];
}
