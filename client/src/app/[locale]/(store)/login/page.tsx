import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import LoginForm from "@/app/[locale]/(components)/Forms/LoginForm";

export default function LoginPage() {
	return (
		<SectionWrapper className="py-0">
			<InnerWrapper>
				<div className="flex min-h-[calc(100svh-108px)] flex-col items-center justify-center">
					<div className="w-full">
						<LoginForm />
					</div>
				</div>
			</InnerWrapper>
		</SectionWrapper>
	);
}
