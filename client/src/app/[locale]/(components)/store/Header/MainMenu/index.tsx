import { getCategories } from "@/app/actions/productCategoryActions";
import MainMenuClient from "./MainMenuClient";

export default async function MainMenu() {
	const categories = await getCategories();

	if (!categories) return <div>Failed to load categories</div>;
	return <MainMenuClient categories={categories} />;
}
