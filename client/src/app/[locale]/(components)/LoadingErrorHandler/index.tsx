"use client";

import React from "react";

interface LoadingErrorHandlerProps {
	isLoading: boolean;
	isError: boolean;
	data: any[] | Record<string, any> | null | undefined;
	errorMessage?: string;
	loadingMessage?: string;
	noDataMessage?: string;
	children: React.ReactNode;
}

// Helper function to check if data is empty
const isEmpty = (
	data: any[] | Record<string, any> | null | undefined
): boolean => {
	if (!data) return true;
	if (Array.isArray(data)) return data.length === 0;
	if (typeof data === "object") return Object.keys(data).length === 0;
	return true;
};

const LoadingErrorHandler: React.FC<LoadingErrorHandlerProps> = ({
	isLoading,
	isError,
	data,
	errorMessage = "Failed to load data.",
	loadingMessage = "Loading...",
	noDataMessage = "No data available.",
	children,
}) => {
	if (isLoading)
		return <p className="text-center text-gray-500">{loadingMessage}</p>;
	if (isError)
		return <p className="text-center text-red-500">{errorMessage}</p>;
	if (isEmpty(data))
		return <p className="text-center text-gray-500">{noDataMessage}</p>;

	return <>{children}</>;
};

export default LoadingErrorHandler;
