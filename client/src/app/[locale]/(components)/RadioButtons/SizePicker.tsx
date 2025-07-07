"use client";

import { Label } from "@/shadcn/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shadcn/components/ui/radio-group";
import { useTranslations } from "next-intl";

interface SizePickerProps {
	id?: string;
	translationKey?: string;
	sizes: string[];
	defaultValue?: string;
	onChange?: (value: string) => void;
}

const SizePicker: React.FC<SizePickerProps> = ({
	id = "size",
	translationKey = "Size",
	sizes,
	defaultValue,
	onChange,
}) => {
	const t = useTranslations();

	return (
		<div className="grid gap-2">
			{/* <Label htmlFor={id} className="text-base">
				{t(translationKey)}
			</Label> */}
			<RadioGroup
				id={id}
				defaultValue={defaultValue}
				className="flex items-center gap-2"
				onValueChange={onChange} // ✅ Pass selected value to parent
			>
				{sizes.map((size) => (
					<Label
						key={size}
						htmlFor={`${id}-${size}`}
						className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
					>
						<RadioGroupItem id={`${id}-${size}`} value={size} />
						{size}
					</Label>
				))}
			</RadioGroup>
		</div>
	);
};

export default SizePicker;
