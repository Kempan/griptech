import Link from "next/link";

const Footer = () => {
	return (
		<footer className="border-t bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
			<div className="grid grid-cols-3 items-center gap-4 px-4 py-2 mx-auto [& a]:hover:underline">
				<Link
					href="#"
					className="flex items-center gap-2 font-medium"
					prefetch={false}
				>
					Home
				</Link>
				<nav className="flex items-center justify-center gap-4 text-center sm:gap-8 md:order-1 lg:justify-end lg:order-2 lg:gap-12">
					<Link
						href="#"
						className="flex items-center gap-2 font-medium"
						prefetch={false}
					>
						Features
					</Link>
					<Link
						href="#"
						className="flex items-center gap-2 font-medium"
						prefetch={false}
					>
						Pricing
					</Link>
					<Link
						href="#"
						className="flex items-center gap-2 font-medium"
						prefetch={false}
					>
						Contact
					</Link>
				</nav>
				<nav className="flex items-center justify-end gap-4 text-center sm:gap-8 md:gap-12">
					<Link
						href="#"
						className="flex items-center font-medium"
						prefetch={false}
					>
						Support
					</Link>
					<Link
						href="#"
						className="flex items-center font-medium"
						prefetch={false}
					>
						FAQ
					</Link>
					<Link
						href="#"
						className="flex items-center font-medium"
						prefetch={false}
					>
						Terms
					</Link>
				</nav>
			</div>
		</footer>
	);
};

export default Footer;
