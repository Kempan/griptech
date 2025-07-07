// client/src/app/[locale]/(components)/AppWrapper/index.tsx
import Header from "@/app/[locale]/(components)/store/Header";
import Footer from "@/app/[locale]/(components)/store/Footer";

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex flex-col bg-gray-50 w-full min-h-screen">
			<Header />
			<main className="flex flex-col w-full h-full mt-[80px] min-h-[calc(100vh-108px)]">
				{children}
			</main>
			<Footer />
		</div>
	);
};

export default StoreLayout;
