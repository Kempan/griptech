"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/shadcn/lib/utils"

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
	indeterminate?: boolean
}

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	CheckboxProps
>(({ className, indeterminate, ...props }, ref) => {
	const internalRef = React.useRef<HTMLButtonElement>(null)

	React.useEffect(() => {
		if (internalRef.current) {
			internalRef.current.setAttribute('data-indeterminate', indeterminate ? 'true' : 'false')
		}
	}, [indeterminate])

	return (
		<CheckboxPrimitive.Root
			ref={internalRef}
			className={cn(
				"peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[indeterminate=true]:bg-primary data-[indeterminate=true]:text-primary-foreground",
				className
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				className={cn("flex items-center justify-center text-current")}
			>
				<Check className="h-4 w-4" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	)
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
