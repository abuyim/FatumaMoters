import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MessageCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/types/site";

interface HeroSliderProps {
  slides: HeroSlide[];
  whatsapp: string;
}

const isExternalLink = (href: string) => /^https?:\/\//.test(href);

const HeroSlider = ({ slides, whatsapp }: HeroSliderProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi || slides.length <= 1) {
      return undefined;
    }

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();
    emblaApi.on("select", onSelect);

    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 6500);

    return () => {
      window.clearInterval(timer);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-charcoal text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.38),transparent_42%),linear-gradient(135deg,rgba(10,14,21,0.94),rgba(10,14,21,0.58))]" />
      <div className="embla relative" ref={emblaRef}>
        <div className="embla__container flex">
          {slides.map((slide) => (
            <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]">
              <div className="absolute inset-0">
                {slide.mediaType === "video" ? (
                  <video
                    className="h-full w-full object-cover opacity-45"
                    src={slide.mediaUrl}
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={slide.mediaUrl}
                    alt={slide.title}
                    className="h-full w-full object-cover opacity-35"
                  />
                )}
              </div>

              <div className="container relative z-10 grid min-h-[34rem] items-end py-20 md:min-h-[40rem] md:py-28">
                <div className="max-w-3xl rounded-[2rem] border border-white/10 bg-white/8 p-8 shadow-2xl backdrop-blur-sm md:p-10">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                      {slide.eyebrow}
                    </span>
                    {slide.mediaType === "video" && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-medium text-white/90">
                        <Play className="h-3.5 w-3.5" /> Video slide
                      </span>
                    )}
                  </div>
                  <h1 className="font-heading text-4xl font-black leading-tight tracking-tight md:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 md:text-lg">
                    {slide.description}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    {isExternalLink(slide.primaryCtaLink) ? (
                      <Button asChild size="lg">
                        <a href={slide.primaryCtaLink} target="_blank" rel="noreferrer">{slide.primaryCtaLabel}</a>
                      </Button>
                    ) : (
                      <Button asChild size="lg">
                        <Link to={slide.primaryCtaLink}>{slide.primaryCtaLabel}</Link>
                      </Button>
                    )}
                    {isExternalLink(slide.secondaryCtaLink) ? (
                      <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                        <a href={slide.secondaryCtaLink} target="_blank" rel="noreferrer">{slide.secondaryCtaLabel}</a>
                      </Button>
                    ) : (
                      <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                        <Link to={slide.secondaryCtaLink}>{slide.secondaryCtaLabel}</Link>
                      </Button>
                    )}
                    <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                      <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20">
          <div className="container flex items-center justify-between gap-6">
            <div className="pointer-events-auto flex gap-2">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => emblaApi?.scrollPrev()}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => emblaApi?.scrollNext()}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="pointer-events-auto flex gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`h-2.5 rounded-full transition ${
                    selectedIndex === index ? "w-10 bg-amber-300" : "w-5 bg-white/35"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
