"use client";

// client/src/app/[locale]/(admin)/admin/order/components/OrderNotes.tsx
import { useState } from "react";
import { updateOrderAdminNote } from "@/app/actions/admin/orderActions";
import { Button } from "@/shadcn/components/ui/button";
import { Textarea } from "@/shadcn/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface OrderNotesProps {
	orderId: number;
	adminNote?: string | null;
	customerNote?: string | null;
}

export default function OrderNotes({
	orderId,
	adminNote,
	customerNote,
}: OrderNotesProps) {
	const router = useRouter();
	const [note, setNote] = useState(adminNote || "");
	const [isSaving, setIsSaving] = useState(false);
	const t = useTranslations();
	const handleSaveNote = async () => {
		setIsSaving(true);
		try {
			await updateOrderAdminNote(orderId, note);
			toast.success(t("adminNoteUpdated"));
			router.refresh(); // Refresh the page to show updated data
		} catch (error) {
			console.error("Error updating admin note:", error);
			toast.error(t("failedToUpdateAdminNote"));
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-4 mt-6">
			{/* Admin Notes */}
			<div>
				<h3 className="font-medium mb-2">{t("adminNotes")}</h3>
				<Textarea
					value={note}
					onChange={(e) => setNote(e.target.value)}
					rows={3}
					placeholder={t("addInternalNotes")}
					className="mb-2"
				/>
				<Button
					onClick={handleSaveNote}
					disabled={isSaving || note === adminNote}
					size="sm"
				>
					{isSaving ? t("saving") : t("saveNote")}
				</Button>
			</div>

			{/* Customer Notes */}
			{customerNote && (
				<div className="mt-4">
					<h3 className="font-medium mb-2">{t("customerNotes")}</h3>
					<div className="p-3 bg-gray-50 rounded border border-gray-200">
						<p className="text-gray-800">{customerNote}</p>
					</div>
				</div>
			)}
		</div>
	);
}
