// src/app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetAuthStatusQuery } from "@/app/state/api";

interface AuthContextType {
	isLoggedIn: boolean;
	isAdmin: boolean;
	userId?: number;
	roles?: string[];
	isLoading: boolean;
	isError: boolean;
	refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { data, isLoading, isError, refetch } = useGetAuthStatusQuery(
		undefined,
		{
			// Polling every 5 minutes to keep the session fresh
			pollingInterval: 5 * 60 * 1000,
			// Keep previous data while fetching
			refetchOnMountOrArgChange: true,
		}
	);

	const authValue: AuthContextType = {
		isLoggedIn: !!data?.isLoggedIn,
		isAdmin: data?.roles?.includes("admin") ?? false,
		userId: data?.userId,
		roles: data?.roles,
		isLoading,
		isError,
		refetch,
	};

	return (
		<AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
