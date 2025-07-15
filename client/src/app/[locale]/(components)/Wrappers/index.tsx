import React, { ReactNode } from "react";

type WrapperProps = {
	children: ReactNode;
	className?: string;
	id?: string;
};

export const SectionWrapper: React.FC<WrapperProps> = ({
	children,
	className = "",
	id,
}) => {
	return (
		<section
			id={id}
			className={`mx-auto max-w-[2600px] w-full ${className}`}
		>
			{children}
		</section>
	);
};

export const InnerWrapper: React.FC<WrapperProps> = ({
	children,
	className = "",
	id,
}) => {
	return (
		<div
			id={id}
			className={`mx-auto md:max-w-[1200px] p-3 md:p-6 ${className}`}
		>
			{children}
		</div>
	);
};