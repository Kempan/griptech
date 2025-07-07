"use client";

import * as React from "react";
import Link, { LinkProps } from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shadcn/lib/utils";
import { useTranslations } from "next-intl";
import { LucideIcon } from "lucide-react"; // Import Lucide Icons support

// Reuse button styles from ShadCN
const linkButtonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
				error:
					"bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
				outline:
					"border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 rounded-md px-3 text-xs",
				lg: "h-10 rounded-md px-8",
				icon: "h-9 w-9 p-2",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface LinkButtonProps
	extends LinkProps,
		VariantProps<typeof linkButtonVariants> {
	className?: string;
	translationKey?: string; // Pass a translation key
	children?: React.ReactNode;
	icon?: LucideIcon; // Accept a Lucide icon as a prop
}

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
	(
		{
			className,
			variant,
			size,
			href,
			translationKey,
			icon: Icon,
			children,
			...props
		},
		ref
	) => {
		const t = useTranslations();

		return (
			<Link
				ref={ref}
				href={href}
				className={cn(linkButtonVariants({ variant, size, className }))}
				{...props}
			>
				{Icon && <Icon className="w-4 h-4" />}{" "}
				{/* Render the icon if provided */}
				{translationKey ? t(translationKey) : children}
			</Link>
		);
	}
);
LinkButton.displayName = "LinkButton";

export default LinkButton;
