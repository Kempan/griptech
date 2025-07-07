import CartCounterClient from "./CartCounterClient";

// Server component
export default function CartCounterWrapper() {
	return (
		<div className="relative">
			<CartCounterClient />
		</div>
	);
}