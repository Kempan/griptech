import { ReactNode } from "react";
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/shadcn/components/ui/sidebar";
import { AppSidebar } from "@/shadcn/components/app-sidebar";
import { Separator } from "@/shadcn/components/ui/separator";
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbSeparator,
	BreadcrumbPage,
} from "@/shadcn/components/ui/breadcrumb";

interface SidebarLayoutProps {
	children: ReactNode;
	categoryData?: any;
	topLevelCategoryData?: any;
	allCategories?: any;
}

export default function SidebarLayout({
	children,
	categoryData,
	topLevelCategoryData,
	allCategories,
}: SidebarLayoutProps) {
	const getCategoryBreadcrumb = (
		category: any
	): { name: string; slug: string }[] => {
		let breadcrumbTrail = [];
		let currentCategory = category;
		while (currentCategory) {
			breadcrumbTrail.unshift({
				name: currentCategory.name,
				slug: currentCategory.slug,
			});
			currentCategory = currentCategory.parent;
		}
		return breadcrumbTrail;
	};

	return (
		<SidebarProvider>
			<AppSidebar
				topLevelCategoryData={topLevelCategoryData}
				activeCategorySlug={categoryData?.slug}
				allCategories={allCategories}
			/>
			<SidebarInset>
				<header className="flex h-16 shrink-0 border-b items-center gap-2">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="/">Griptech</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								{categoryData &&
									getCategoryBreadcrumb(categoryData).map(
										(breadcrumb, index, array) => (
											<BreadcrumbItem key={breadcrumb.slug}>
												{index !== array.length - 1 ? (
													<>
														<BreadcrumbLink
															href={`/product-category/${breadcrumb.slug}`}
														>
															{breadcrumb.name}
														</BreadcrumbLink>
														<BreadcrumbSeparator />
													</>
												) : (
													<BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
												)}
											</BreadcrumbItem>
										)
									)}
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 overflow-y-auto">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
