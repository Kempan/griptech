// client/src/app/[locale]/(components)/LanguageSwitcher/index.tsx
"use client";

import { useMemo, useCallback } from "react";
import CountrySelect from "@/shadcn/components/ui/country-select";
import { Locale, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";

// Constants outside component to prevent recreation
const LOCALE_TO_COUNTRY: Record<string, string> = {
	sv: "SE",
	en: "US",
};

const COUNTRY_TO_LOCALE: Record<string, Locale> = {
	SE: "sv",
	US: "en",
};

const ALL_COUNTRIES = ["SE", "US"];

const LanguageSwitcher = () => {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams();

	// Get current country code based on locale
	const currentCountry = LOCALE_TO_COUNTRY[locale] || locale.toUpperCase();

	// Memoize filtered countries to prevent recreation
	const availableCountries = useMemo(
		() => ALL_COUNTRIES.filter((c) => c !== currentCountry),
		[currentCountry]
	);

	// Memoize the change handler
	const handleCountryChange = useCallback(
		(nextCountry: string) => {
			const nextLocale =
				COUNTRY_TO_LOCALE[nextCountry] || (nextCountry.toLowerCase() as Locale);

			router.replace(
				// @ts-expect-error -- TypeScript will validate that only known `params`
				// are used in combination with a given `pathname`. Since the two will
				// always match for the current route, we can skip runtime checks.
				{ pathname, params },
				{ locale: nextLocale }
			);
		},
		[router, pathname, params]
	);

	return (
		<CountrySelect
			className="w-[70px]"
			onChange={handleCountryChange}
			value={currentCountry}
			placeholder={currentCountry}
			whitelist={availableCountries}
		/>
	);
};

export default LanguageSwitcher;
