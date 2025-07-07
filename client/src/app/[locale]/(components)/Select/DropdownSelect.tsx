"use client";

import { useState } from "react";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/shadcn/components/ui/select";
import { useTranslations } from "next-intl";

interface DropdownSelectProps {
	id?: string;
	translationKey?: string;
	options: Array<{ value: string | number; labelKey?: string | number }>;
	defaultValue?: string | number;
	onChange?: (value: string | number) => void;
	className?: string;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
	id,
	translationKey,
	options,
	defaultValue,
	onChange,
	className,
}) => {
	const t = useTranslations();
	const [selectedValue, setSelectedValue] = useState<string | number>(
		defaultValue ?? options[0]?.value
	);

	// ✅ Update state and notify parent
	const handleChange = (value: string) => {
		const parsedValue = isNaN(Number(value)) ? value : Number(value);
		setSelectedValue(parsedValue);
		onChange?.(parsedValue); // ✅ Only call onChange if provided
	};

	return (
		<div className="grid gap-2">
			{/* {translationKey && (
				<label htmlFor={id} className="text-base font-medium">
					{t(translationKey)}
				</label>
			)} */}
			<Select value={selectedValue.toString()} onValueChange={handleChange}>
				<SelectTrigger id={id} className={`w-24 ${className}`}>
					<SelectValue placeholder={t("Select")} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value.toString()}>
							{typeof option.labelKey === "string"
								? t(option.labelKey)
								: option.labelKey}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

export default DropdownSelect;
