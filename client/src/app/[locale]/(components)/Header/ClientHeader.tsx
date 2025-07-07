// CLientHeader.tsx - For use in Client Components

import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/shadcn/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type HeaderProps = {
	translationKey?: string;
	text?: string;
	className?: string;
	as?: HeadingLevel;
};

const Header = ({
	translationKey,
	text,
	className,
	as = "h1",
}: HeaderProps) => {
	const t = useTranslations();

	// Determine content from either translation key or direct text
	const content = translationKey ? t(translationKey) : text;

	// Define heading styles based on level
	const styles = {
		h1: "text-3xl leading-[1.2] mb-4 font-semibold",
		h2: "text-2xl leading-[1.3] mb-3 font-semibold",
		h3: "text-xl leading-[1.4] mb-2 font-medium",
		h4: "text-lg leading-[1.5] mb-2 font-medium",
		h5: "text-base leading-[1.6] mb-2 font-medium",
		h6: "text-sm leading-[1.7] mb-2 font-medium",
	};

	// Dynamically render the heading level with appropriate styles
	const Component = as;

	return <Component className={cn(styles[as], className)}>{content}</Component>;
};

export default Header;
