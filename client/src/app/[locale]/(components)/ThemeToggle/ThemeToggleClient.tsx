/* --- client/src/app/[locale]/(components)/ThemeToggle/ThemeToggleClient.tsx --- */
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ThemeToggleClientProps {
	icons: {
		sun: React.ReactNode;
		moon: React.ReactNode;
	};
}

export default function ThemeToggleClient({ icons }: ThemeToggleClientProps) {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Effect only runs client-side and indicates when the component is mounted
	useEffect(() => {
		setMounted(true);
	}, []);

	// Handle the theme toggle
	const toggleTheme = () => {
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	};

	// DOM structure remains consistent to prevent layout shift
	return (
		<div
			className="cursor-pointer"
			onClick={mounted ? toggleTheme : undefined}
			aria-label={
				mounted
					? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`
					: "Loading theme"
			}
		>
			{!mounted ? (
				// Show loader with the same dimensions as the icons
				<Loader2
					className="animate-spin text-gray-500"
					size={24}
					strokeWidth={1.5}
				/>
			) : resolvedTheme === "dark" ? (
				// Sun icon for dark mode
				icons.sun
			) : (
				// Moon icon for light mode
				icons.moon
			)}
		</div>
	);
}
