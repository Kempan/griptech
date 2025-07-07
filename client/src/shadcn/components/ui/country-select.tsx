// client/src/shadcn/components/ui/country-select.tsx
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/shadcn/components/ui/select";
import { filterCountries } from "@/shadcn/lib/helpers";
//@ts-ignore
import countryRegionData from "country-region-data/dist/data-umd";
import { useMemo } from "react";
import ReactCountryFlag from "react-country-flag";

export interface Region {
	name: string;
	shortCode: string;
}

export interface CountryRegion {
	countryName: string;
	countryShortCode: string;
	regions: Region[];
}

interface CountrySelectProps {
	priorityOptions?: string[];
	whitelist?: string[];
	blacklist?: string[];
	onChange?: (value: string) => void;
	className?: string;
	placeholder?: string;
	value?: string; // Add controlled value prop
}

function CountrySelect({
	priorityOptions = [],
	whitelist = [],
	blacklist = [],
	onChange = () => {},
	className,
	placeholder = "Country",
	value,
}: CountrySelectProps) {
	// Use useMemo to memoize filtered countries
	const countries = useMemo(
		() =>
			filterCountries(countryRegionData, priorityOptions, whitelist, blacklist),
		[priorityOptions, whitelist, blacklist]
	);

	return (
		<Select value={value || placeholder} onValueChange={onChange}>
			<SelectTrigger className={className}>
				<ReactCountryFlag
					countryCode={value || placeholder}
					style={{
						fontSize: "1.5rem",
						lineHeight: "1.5rem",
						marginLeft: "0.3rem",
					}}
				/>
			</SelectTrigger>
			<SelectContent className="min-w-[unset] cursor-pointer">
				{countries.map(({ countryName, countryShortCode }) => (
					<SelectItem
						key={countryShortCode}
						value={countryShortCode}
						className="cursor-pointer"
					>
						<div className="flex items-center gap-2">
							<ReactCountryFlag
								countryCode={countryShortCode}
								style={{
									fontSize: "1.5rem",
									lineHeight: "1.5rem",
								}}
							/>
							<span className="sr-only">{countryName}</span>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export default CountrySelect;
