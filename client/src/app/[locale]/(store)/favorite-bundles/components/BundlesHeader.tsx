// client/src/app/[locale]/(store)/favorites/components/BundlesHeader.tsx
"use client";

import { useState } from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";
import { useTranslations } from "next-intl";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shadcn/components/ui/dialog";
import { Input } from "@/shadcn/components/ui/input";
import { Label } from "@/shadcn/components/ui/label";
import { Textarea } from "@/shadcn/components/ui/textarea";
import { createBundle } from "@/app/actions/bundleActions";
import { useRouter } from "next/navigation";

export default function BundlesHeader() {
	const t = useTranslations();
	const router = useRouter();
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [bundleName, setBundleName] = useState("");
	const [bundleDescription, setBundleDescription] = useState("");

	const handleCreateBundle = async () => {
		if (!bundleName.trim()) return;

		setIsCreating(true);
		try {
			const result = await createBundle({
				name: bundleName.trim(),
				description: bundleDescription.trim() || undefined,
			});

			if (result.success) {
				setShowCreateDialog(false);
				setBundleName("");
				setBundleDescription("");
				router.refresh();
			}
		} catch (error) {
			console.error("Error creating bundle:", error);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<>
			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<Package className="w-8 h-8 text-blue-500" />
						<h1 className="text-3xl font-bold">{t("ProductBundles")}</h1>
					</div>

					<Button onClick={() => setShowCreateDialog(true)}>
						<Plus className="w-4 h-4 mr-2" />
						{t("CreateBundle")}
					</Button>
				</div>

				<p className="text-gray-600">{t("CreateAndManageBundles")}</p>
			</div>

			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("CreateNewBundle")}</DialogTitle>
						<DialogDescription>
							{t("CreateBundleDescription")}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="bundle-name">{t("BundleName")}</Label>
							<Input
								id="bundle-name"
								value={bundleName}
								onChange={(e) => setBundleName(e.target.value)}
								placeholder={t("BundleNamePlaceholder")}
								disabled={isCreating}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="bundle-description">
								{t("Description")} ({t("Optional")})
							</Label>
							<Textarea
								id="bundle-description"
								value={bundleDescription}
								onChange={(e) => setBundleDescription(e.target.value)}
								placeholder={t("BundleDescriptionPlaceholder")}
								rows={3}
								disabled={isCreating}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowCreateDialog(false)}
							disabled={isCreating}
						>
							{t("Cancel")}
						</Button>
						<Button
							onClick={handleCreateBundle}
							disabled={!bundleName.trim() || isCreating}
						>
							{isCreating ? t("Creating") : t("Create")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
