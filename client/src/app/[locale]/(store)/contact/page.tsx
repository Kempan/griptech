import {
	SectionWrapper,
	InnerWrapper,
} from "@/app/[locale]/(components)/Wrappers";
import ContactForm from "@/app/[locale]/(components)/Forms/ContactForm";

const ContactPage = () => {
	return (
		<SectionWrapper className="py-0">
			<InnerWrapper>
				<div className="flex flex-col items-center justify-center min-h-[calc(100svh-108px)]">
					<div className="w-full">
						<ContactForm />
					</div>
				</div>
			</InnerWrapper>
		</SectionWrapper>
	);
};

export default ContactPage;
