// client/src/app/[locale]/(admin)/admin/settings/page.tsx
import { ServerHeader } from "@/app/[locale]/(components)/Header/ServerHeader";
import SettingsClient from "./components/SettingsClient";
import { getTranslations } from "next-intl/server";

// Define the same type as in your client component
type SettingType = "text" | "toggle";

interface UserSetting {
	label: string;
	value: string | boolean;
	type: SettingType;
}

// Mock settings data with proper typing
const mockSettings: UserSetting[] = [
	{ label: "Username", value: "john_doe", type: "text" },
	{ label: "Email", value: "john.doe@example.com", type: "text" },
	{ label: "Notification", value: true, type: "toggle" },
	{ label: "Dark Mode", value: false, type: "toggle" },
	{ label: "Language", value: "English", type: "text" },
];

interface SettingsPageProps {
	searchParams: Promise<{
		search?: string;
		page?: number;
	}>;
}

export default async function Settings({ searchParams }: SettingsPageProps) {
	const t = await getTranslations();
	const userSettings = mockSettings;

	return (
		<div className="mx-auto pb-4 w-full">
			<ServerHeader text={t("userSettings")} />
			<SettingsClient initialSettings={userSettings} />
		</div>
	);
}
