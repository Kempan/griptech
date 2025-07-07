import { Search, Store } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import MainMenu from "@/app/[locale]/(components)/store/Header/MainMenu";
import LanguageSwitcher from "@/app/[locale]/(components)/LanguageSwitcher";
import ThemeToggle from "@/app/[locale]/(components)/ThemeToggle";
import CartCounter from "./CartCounter";
import UserDropdownMenu from "@/app/[locale]/(components)/UserDropdownMenu";

const Header = () => {
	return (
		<header className="flex justify-between items-center w-full p-6 w-full fixed bg-gray-50 top-0 z-50 border-b h-[80px]">
			{/* LEFT SIDE */}
			<div className="flex flex-1 justify-between items-center gap-5">
				<Link href="/">
					<Image
						src="/images/griptech-logo-transparent.png"	
						alt="logotype"
						width={200}
						height={32}
						priority
					/>
				</Link>
			</div>

			<div className="hidden lg:flex relative flex justify-center flex-1">
				<MainMenu />
			</div>

			{/* RIGHT SIDE */}
			<div className="flex justify-end items-center gap-5 flex-1">
				<div className="hidden lg:flex items-center gap-5">

					<Link href="/admin">
						<Store
							className="cursor-pointer"
							size={24}
							strokeWidth={1.4}
						/>
					</Link>
					<UserDropdownMenu />
					<ThemeToggle />
					<div className="flex items-center flex-col">
						<LanguageSwitcher />
					</div>
					<hr className="w-0 h-7 border border-solid border-l border-gray-300" />
				</div>

				<CartCounter />
			</div>
		</header>
	);
};

export default Header;
