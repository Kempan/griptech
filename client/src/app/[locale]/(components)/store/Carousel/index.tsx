"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shadcn/lib/utils";

interface CompactCarouselProps {
	slides: ReactNode[];
	options?: EmblaOptionsType;
	className?: string;
	slideClassName?: string;
	showControls?: boolean;
	showDots?: boolean;
	autoplay?: boolean;
	autoplayInterval?: number;
	header?: ReactNode;
}

/**
 * A lightweight, simple carousel component optimized for mobile
 * Designed to be used in sidebars, small UI sections, and image galleries
 * Follows Embla Carousel standards for proper responsiveness
 */
export default function CompactCarousel({
	slides,
	options = { loop: true, align: "center" },
	className,
	slideClassName,
	showControls = true,
	showDots = true,
	autoplay = false,
	autoplayInterval = 5000,
	header,
}: CompactCarouselProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel(options);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
	const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
	const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

	const onInit = useCallback((emblaApi: EmblaCarouselType) => {
		setScrollSnaps(emblaApi.scrollSnapList());
	}, []);

	const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
		setSelectedIndex(emblaApi.selectedScrollSnap());
		setPrevBtnEnabled(emblaApi.canScrollPrev());
		setNextBtnEnabled(emblaApi.canScrollNext());
	}, []);

	useEffect(() => {
		if (!emblaApi) return;

		onInit(emblaApi);
		onSelect(emblaApi);
		emblaApi.on("reInit", onInit);
		emblaApi.on("reInit", onSelect);
		emblaApi.on("select", onSelect);

		return () => {
			emblaApi.off("reInit", onInit);
			emblaApi.off("reInit", onSelect);
			emblaApi.off("select", onSelect);
		};
	}, [emblaApi, onInit, onSelect]);

	// Autoplay functionality
	useEffect(() => {
		if (!emblaApi || !autoplay) return;

		const intervalId = setInterval(() => {
			if (emblaApi.canScrollNext()) {
				emblaApi.scrollNext();
			} else {
				emblaApi.scrollTo(0); // Loop back to start
			}
		}, autoplayInterval);

		// Pause autoplay on user interaction
		const onPointerDown = () => clearInterval(intervalId);
		emblaApi.on("pointerDown", onPointerDown);

		return () => {
			clearInterval(intervalId);
			emblaApi && emblaApi.off("pointerDown", onPointerDown);
		};
	}, [emblaApi, autoplay, autoplayInterval]);

	const scrollPrev = useCallback(
		() => emblaApi && emblaApi.scrollPrev(),
		[emblaApi]
	);
	const scrollNext = useCallback(
		() => emblaApi && emblaApi.scrollNext(),
		[emblaApi]
	);
	const scrollTo = useCallback(
		(index: number) => emblaApi && emblaApi.scrollTo(index),
		[emblaApi]
	);

	return (
		<div className={cn("embla relative", className)}>
			{/* Optional header */}
			{header && <div className="embla__header mb-3">{header}</div>}

			{/* Main carousel container - this class is important for Embla */}
			<div className="embla__viewport overflow-hidden" ref={emblaRef}>
				{/* The container that holds all the slides - this class is important for Embla */}
				<div className="embla__container flex">
					{slides.map((slide, index) => (
						<div
							key={index}
							className={cn(
								"embla__slide flex-[0_0_auto] min-w-0",
								// Default responsive behavior can be controlled through Embla options
								slideClassName || "w-full md:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5"
							)}
						>
							<div className="embla__slide__inner relative h-full">{slide}</div>
						</div>
					))}
				</div>
			</div>

			{/* Navigation buttons */}
			{showControls && slides.length > 1 && (
				<>
					<button
						onClick={scrollPrev}
						className={cn(
							"embla__prev absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/70 rounded-full shadow-sm z-10 transition-opacity",
							!prevBtnEnabled &&
								!options.loop &&
								"opacity-50 cursor-not-allowed"
						)}
						disabled={!prevBtnEnabled && !options.loop}
						aria-label="Previous slide"
					>
						<ChevronLeft className="h-4 w-4" />
					</button>
					<button
						onClick={scrollNext}
						className={cn(
							"embla__next absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/70 rounded-full shadow-sm z-10 transition-opacity",
							!nextBtnEnabled &&
								!options.loop &&
								"opacity-50 cursor-not-allowed"
						)}
						disabled={!nextBtnEnabled && !options.loop}
						aria-label="Next slide"
					>
						<ChevronRight className="h-4 w-4" />
					</button>
				</>
			)}

			{/* Pagination dots */}
			{showDots && scrollSnaps.length > 1 && (
				<div className="embla__dots flex justify-center gap-1 mt-2">
					{scrollSnaps.map((_, index) => (
						<button
							key={index}
							onClick={() => scrollTo(index)}
							className={cn(
								"embla__dot w-2 h-2 rounded-full transition-colors",
								selectedIndex === index ? "bg-primary" : "bg-gray-300"
							)}
							aria-label={`Go to slide ${index + 1}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}
