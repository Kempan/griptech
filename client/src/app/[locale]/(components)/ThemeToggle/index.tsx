/* --- client/src/app/[locale]/(components)/ThemeToggle/index.tsx --- */
// Server Component
import { Sun, Moon } from "lucide-react";
import ThemeToggleClient from "./ThemeToggleClient";

// This component can be imported by other server components
export default function ThemeToggle() {
	// Pre-render both icons with minimal styling to avoid layout shift
	return (
		<ThemeToggleClient
			icons={{
				sun: <Sun size={24} strokeWidth={1.5} />,
				moon: <Moon size={24} strokeWidth={1.5} />,
			}}
		/>
	);
}
