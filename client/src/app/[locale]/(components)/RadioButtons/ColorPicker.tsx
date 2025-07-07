import { Label } from "@/shadcn/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shadcn/components/ui/radio-group";
import { useTranslations } from "next-intl";

interface ColorPickerProps {
	id?: string;
	translationKey?: string; // Translation key for the label
	colors: string[];
	defaultValue?: string;
	onChange?: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
	id = "color",
	translationKey = "Color",
	colors,
	defaultValue,
	onChange,
}) => {
	const t = useTranslations();

	return (
		<div className="grid gap-2">
			<Label htmlFor={id} className="text-base">
				{t(translationKey)}
			</Label>
			<RadioGroup
				id={id}
				defaultValue={defaultValue}
				className="flex items-center gap-2"
				onValueChange={onChange}
			>
				{colors.map((color) => (
					<Label
						key={color}
						htmlFor={`${id}-${color}`}
						className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
					>
						<RadioGroupItem id={`${id}-${color}`} value={color} />
						{t(`${color}`)}
					</Label>
				))}
			</RadioGroup>
		</div>
	);
};

export default ColorPicker;
