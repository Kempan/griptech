"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/shadcn/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/shadcn/components/ui/sidebar";
import { useTranslations } from "next-intl";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: LucideIcon;
		isActive?: boolean;
		children?: {
			title: string;
			url: string;
			isActive?: boolean;
		}[];
	}[];
}) {
	const t = useTranslations();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>{t("Categories")}</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => {

					return (
						<Collapsible
							key={item.title}
							asChild
							defaultOpen={item.isActive}
							className="group/collapsible"
						>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton tooltip={item.title}>
										{item.children && item.children.length > 0 ? (
											<>
												<span>{item.title}</span>
												<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
											</>
										) : (
											<>
												<Link href={item.url}>
													<span>{item.title}</span>
												</Link>
											</>
										)}
									</SidebarMenuButton>
								</CollapsibleTrigger>
								{item.children && item.children.length > 0 && (
									<CollapsibleContent>
										<SidebarMenuSub>
											<SidebarMenuSubItem key={`${item.title}-all`}>
												<SidebarMenuSubButton asChild>
													<Link href={item.url}>
														<span>Visa allt</span>
													</Link>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
											{item.children.map((childItem) => (
												<SidebarMenuSubItem key={childItem.title}>
													<SidebarMenuSubButton
														asChild
														className={
															childItem.isActive
																? "font-medium underline"
																: ""
														}
													>
														<Link href={childItem.url}>
															<span>{childItem.title}</span>
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								)}
							</SidebarMenuItem>
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
