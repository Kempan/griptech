// ServerHeader.tsx - For use in Server Components
import { getTranslations } from "next-intl/server";

type HeaderServerProps = {
	translationKey?: string;
	text?: string;
	className?: string;
	as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};

export async function ServerHeader({
	translationKey,
	text,
	className = "",
	as = "h1",
}: HeaderServerProps) {
	// Only fetch translations if a key is provided
	let content = text;

	if (translationKey) {
		const t = await getTranslations();
		content = t(translationKey);
	}

	const Component = as;

	const styles = {
		h1: "text-3xl leading-[1.2] mb-4 font-semibold",
		h2: "text-2xl leading-[1.3] mb-3 font-semibold",
		h3: "text-xl leading-[1.4] mb-2 font-medium",
		h4: "text-lg leading-[1.5] mb-2 font-medium",
    h5: "text-base leading-[1.6] mb-2 font-medium",
		h6: "text-sm leading-[1.7] mb-2 font-medium",
	};

	return (
		<Component className={`${styles[as]} ${className}`}>{content}</Component>
	);
}
