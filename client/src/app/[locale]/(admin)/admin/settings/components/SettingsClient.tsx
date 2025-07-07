// client/src/app/[locale]/(admin)/admin/settings/components/SettingsClient.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/shadcn/components/ui/input";
import { Switch } from "@/shadcn/components/ui/switch";
import { Label } from "@/shadcn/components/ui/label";
import { Button } from "@/shadcn/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shadcn/components/ui/table";

type SettingType = "text" | "toggle";

interface UserSetting {
	label: string;
	value: string | boolean;
	type: SettingType;
}

interface SettingsClientProps {
	initialSettings: UserSetting[];
}

export default function SettingsClient({
	initialSettings,
}: SettingsClientProps) {
	const [settings, setSettings] = useState<UserSetting[]>(initialSettings);
	const [isModified, setIsModified] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const handleSettingChange = (index: number, newValue: string | boolean) => {
		const updatedSettings = [...settings];
		updatedSettings[index].value = newValue;
		setSettings(updatedSettings);
		setIsModified(true);
	};

	const handleSaveSettings = async () => {
		setIsSaving(true);

		try {
			// In a real app, you would save the settings to your API/database here
			// await updateUserSettings(userId, settings);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			toast.success("Settings saved successfully");
			setIsModified(false);
		} catch (error) {
			toast.error("Failed to save settings");
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mt-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[200px]">Setting</TableHead>
						<TableHead>Value</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{settings.map((setting, index) => (
						<TableRow key={setting.label}>
							<TableCell className="font-medium">{setting.label}</TableCell>
							<TableCell>
								{setting.type === "toggle" ? (
									<div className="flex items-center space-x-2">
										<Switch
											checked={setting.value as boolean}
											onCheckedChange={(checked) =>
												handleSettingChange(index, checked)
											}
											id={`toggle-${index}`}
										/>
										<Label htmlFor={`toggle-${index}`}>
											{setting.value ? "Enabled" : "Disabled"}
										</Label>
									</div>
								) : (
									<Input
										value={setting.value as string}
										onChange={(e) => handleSettingChange(index, e.target.value)}
										className="max-w-sm"
									/>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{isModified && (
				<div className="mt-6 flex justify-end">
					<Button onClick={handleSaveSettings} disabled={isSaving}>
						{isSaving ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			)}
		</div>
	);
}
