import { Skeleton } from "@/shadcn/components/ui/skeleton";
import { SectionWrapper, InnerWrapper } from "@/app/[locale]/(components)/Wrappers";

export function LoadingSkeleton() {
	return (
		<SectionWrapper>
			<InnerWrapper>
				<div className="flex flex-col items-center space-y-3 h-[425px] w-[850px] m-auto">
					<Skeleton className="h-full w-full rounded-xl" />
					<div className="space-y-2 w-full">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-[80%]" />
					</div>
				</div>
			</InnerWrapper>
		</SectionWrapper>
	);
}
