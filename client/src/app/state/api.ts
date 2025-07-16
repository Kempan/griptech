// client/src/app/actions/state/api.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
	NewProduct,
	Product,
	UpdateProductPayload,
	NewCategory,
	ProductCategory,
	User,
	ExpenseByCategory,
	SalesSummary,
	PurchaseSummary,
	ExpenseSummary,
	AuthStatus,
	Order,
	OrderStatus,
	Expense,
} from "@/app/types";

// Interface for dashboard metrics response
export interface DashboardMetrics {
	popularProducts: Product[];
	salesSummary: SalesSummary[];
	purchaseSummary: PurchaseSummary[];
	expenseSummary: ExpenseSummary[];
	expensesByCategorySummary: ExpenseByCategory[];
}

// Admin products response with pagination
export interface AdminProductsResponse {
	products: Product[];
	totalCount: number;
}

// Bundle related types
export interface BundleItem {
	productId: number;
	quantity: number;
	order: number;
	product?: {
		id: number;
		name: string;
		slug: string;
		price: number;
		stockQuantity?: number;
		categories?: Array<{
			id: number;
			name: string;
			slug: string;
		}>;
	};
}

export interface ProductBundle {
	id: number;
	userId: number;
	name: string;
	description?: string | null;
	items: BundleItem[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface BundlesResponse {
	bundles: ProductBundle[];
	totalCount: number;
	pageCount: number;
	currentPage: number;
}

// Favorite related types
export interface Favorite {
	id: number;
	productId: number;
	userId: number;
	createdAt: Date;
	product?: {
		id: number;
		name: string;
		slug: string;
		price: number;
		stockQuantity?: number;
		enableStockManagement?: boolean;
		categories?: Array<{
			id: number;
			name: string;
			slug: string;
		}>;
	};
}

export interface FavoritesResponse {
	favorites: Favorite[];
	totalCount: number;
	pageCount: number;
	currentPage: number;
}

// User profile update type
export interface UpdateUserProfileData {
	name?: string;
	email?: string;
	phone?: string;
	shippingAddress?: any;
	billingAddress?: any;
	currentPassword?: string;
	newPassword?: string;
}

// Custom base query with automatic token refresh
const baseQuery = fetchBaseQuery({
	baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
	credentials: "include",
	prepareHeaders: (headers, { getState }) => {
		// Add any additional headers if needed
		return headers;
	},
});

// Enhanced base query with automatic token refresh
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
	let result = await baseQuery(args, api, extraOptions);

	// If the initial request fails with 401, try to refresh the token
	if (result.error && result.error.status === 401) {
		// Try to refresh the token
		const refreshResult = await baseQuery(
			{
				url: "/api/refresh",
				method: "POST",
				credentials: "include",
			},
			api,
			extraOptions
		);

		if (refreshResult.data) {
			// Token refreshed successfully, retry the original request
			result = await baseQuery(args, api, extraOptions);
		} else {
			// Refresh failed, redirect to login
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
		}
	}

	return result;
};

export const api = createApi({
	baseQuery: baseQueryWithReauth,
	reducerPath: "api",
	tagTypes: [
		"DashboardMetrics",
		"Products",
		"Users",
		"Expenses",
		"Categories",
		"Auth",
	],
	endpoints: (build) => ({
		// Dashboard
		getDashboardMetrics: build.query<DashboardMetrics, void>({
			query: () => "/admin/dashboard",
			providesTags: ["DashboardMetrics"],
		}),

		// Products
		getProducts: build.query<
			Product[],
			{ categorySlug?: string; search?: string; limit?: number } | void
		>({
			query: ({ categorySlug, search, limit } = {}) => ({
				url: "/products",
				params: {
					...(categorySlug && { category: categorySlug }),
					...(search && { search }),
					...(limit && { limit }),
				},
			}),
			providesTags: ["Products"],
		}),

		getProductBySlug: build.query<Product, string>({
			query: (slug) => `/products/by-slug/${slug}`,
			providesTags: ["Products"],
		}),

		getProductById: build.query<Product, number>({
			query: (id) => `/products/${id}`,
			providesTags: ["Products"],
		}),

		// Admin Products
		getAdminProducts: build.query<
			AdminProductsResponse,
			{ search?: string; page?: number; pageSize?: number; sortBy?: string }
		>({
			query: ({ search, page = 1, pageSize = 10, sortBy = "id" }) => ({
				url: "/admin/products",
				params: {
					search,
					page,
					pageSize,
					sortBy,
				},
			}),
			providesTags: ["Products"],
		}),

		createProduct: build.mutation<Product, NewProduct>({
			query: (newProduct) => ({
				url: "/admin/products",
				method: "POST",
				body: newProduct,
			}),
			invalidatesTags: ["Products"],
		}),

		deleteProduct: build.mutation<Product, number>({
			query: (id) => ({
				url: `/admin/products/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Products"],
		}),

		updateProduct: build.mutation<Product, { id: number; data: Partial<NewProduct> }>({
			query: ({ id, data }) => ({
				url: `/admin/products/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Products"],
		}),

		updateProductCategories: build.mutation<
			{ message: string },
			{ id: number; categoryIds: number[] }
		>({
			query: ({ id, categoryIds }) => ({
				url: `/admin/products/${id}/categories`,
				method: "PUT",
				body: { categoryIds },
			}),
			invalidatesTags: ["Products"],
		}),

		// Users
		getUsers: build.query<User[], void>({
			query: () => "/admin/users",
			providesTags: ["Users"],
		}),

		getUserById: build.query<User, number>({
			query: (id) => `/admin/users/${id}`,
			providesTags: ["Users"],
		}),

		createUser: build.mutation<
			User,
			{ name: string; email: string; password: string; roles: string[] }
		>({
			query: (userData) => ({
				url: "/admin/users",
				method: "POST",
				body: userData,
			}),
			invalidatesTags: ["Users"],
		}),

		updateUser: build.mutation<
			User,
			{
				id: number;
				name?: string;
				email?: string;
				password?: string;
				roles?: string[];
			}
		>({
			query: ({ id, ...data }) => ({
				url: `/admin/users/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Users"],
		}),

		deleteUser: build.mutation<{ message: string }, number>({
			query: (id) => ({
				url: `/admin/users/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Users"],
		}),

		// Expenses
		getExpensesByCategory: build.query<ExpenseByCategory[], void>({
			query: () => "/admin/expenses",
			providesTags: ["Expenses"],
		}),

		// Categories
		getCategories: build.query<ProductCategory[], void>({
			query: () => "/categories",
			providesTags: ["Categories"],
		}),

		getCategoryBySlug: build.query<ProductCategory, string>({
			query: (slug) => `/categories/${slug}`,
			providesTags: ["Categories"],
		}),

		getCategoryTopLevelBySlug: build.query<ProductCategory, string>({
			query: (slug) => `/categories/category-top-level/${slug}`,
			providesTags: ["Categories"],
		}),

		getProductsByCategorySlug: build.query<
			Product[],
			{ slug: string; limit?: number }
		>({
			query: ({ slug, limit }) => ({
				url: `/products/by-category/${slug}`,
				params: { ...(limit && { limit }) },
			}),
			providesTags: ["Products"],
		}),

		createCategory: build.mutation<ProductCategory, NewCategory>({
			query: (newCategory) => ({
				url: "/admin/categories",
				method: "POST",
				body: newCategory,
			}),
			invalidatesTags: ["Categories"],
		}),

		deleteCategory: build.mutation<{ message: string }, number>({
			query: (id) => ({
				url: `/admin/categories/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Categories"],
		}),

		// Authentication
		getAuthStatus: build.query<AuthStatus, void>({
			query: () => "/api/session",
			providesTags: ["Auth"],
		}),

		loginUser: build.mutation<
			{
				message: string;
				user: {
					id: number;
					name: string;
					email: string;
					roles: string[];
				};
			},
			{ email: string; password: string }
		>({
			query: (credentials) => ({
				url: "/api/login",
				method: "POST",
				body: credentials,
				credentials: "include",
			}),
			invalidatesTags: ["Auth"],
		}),

		logoutUser: build.mutation<{ message: string }, void>({
			query: () => ({
				url: "/api/logout",
				method: "POST",
				credentials: "include",
			}),
			invalidatesTags: ["Auth"],
		}),

		// Refresh token endpoint
		refreshToken: build.mutation<
			{
				message: string;
				user: {
					id: number;
					name: string;
					email: string;
					roles: string[];
				};
			},
			void
		>({
			query: () => ({
				url: "/api/refresh",
				method: "POST",
				credentials: "include",
			}),
			invalidatesTags: ["Auth"],
		}),
	}),
});

export const {
	// Dashboard
	useGetDashboardMetricsQuery,

	// Products
	useGetProductsQuery,
	useGetProductBySlugQuery,
	useGetProductByIdQuery,
	useGetProductsByCategorySlugQuery,
	useGetAdminProductsQuery,
	useCreateProductMutation,
	useUpdateProductMutation,
	useUpdateProductCategoriesMutation,
	useDeleteProductMutation,

	// Users
	useGetUsersQuery,
	useGetUserByIdQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,

	// Expenses
	useGetExpensesByCategoryQuery,

	// Categories
	useGetCategoriesQuery,
	useGetCategoryBySlugQuery,
	useGetCategoryTopLevelBySlugQuery,
	useCreateCategoryMutation,
	useDeleteCategoryMutation,

	// Authentication
	useGetAuthStatusQuery,
	useLoginUserMutation,
	useLogoutUserMutation,

	// Refresh token
	useRefreshTokenMutation,
} = api;
