// client/src/app/[locale]/(admin)/admin/order/components/AddressDisplay.tsx
export default function AddressDisplay({
	address,
}: {
	address: Record<string, any>;
}) {
	return (
		<div className="space-y-1">
			<p>
				{address.firstName} {address.lastName}
			</p>
			{address.company && <p>{address.company}</p>}
			<p>{address.address1}</p>
			{address.address2 && <p>{address.address2}</p>}
			<p>
				{address.city}, {address.state || ""} {address.postalCode}
			</p>
			<p>{address.country}</p>
			{address.phone && <p>{address.phone}</p>}
		</div>
	);
}
