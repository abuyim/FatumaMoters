import { Link } from "react-router-dom";
import { Shield, ThumbsUp, Wrench, Truck, Star, ChevronRight, Award, MessageCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import VehicleCard from "@/components/VehicleCard";
import SectionHeading from "@/components/SectionHeading";
import Layout from "@/components/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import HeroSlider from "@/components/HeroSlider";
import { PageError, PageLoader } from "@/components/PageState";
import { useSiteContent, useVehicles } from "@/hooks/use-site-data";

const iconCycle = [Shield, CreditCard, Wrench, Truck, ThumbsUp, Award];

const Index = () => {
  const contentQuery = useSiteContent();
  const vehiclesQuery = useVehicles();

  if (contentQuery.isLoading || vehiclesQuery.isLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (contentQuery.isError || vehiclesQuery.isError || !contentQuery.data || !vehiclesQuery.data) {
    return (
      <Layout>
        <PageError message={contentQuery.error?.message || vehiclesQuery.error?.message || "Homepage data could not be loaded."} />
      </Layout>
    );
  }

  const { home, site } = contentQuery.data;
  const featuredVehicles = vehiclesQuery.data.filter((vehicle) => vehicle.popular);

  return (
    <Layout>
      <HeroSlider slides={home.heroSlides} whatsapp={site.whatsapp} />

      <section className="bg-charcoal py-10 text-white">
        <div className="container grid grid-cols-2 gap-4 sm:grid-cols-4">
          {home.stats.map((stat) => (
            <div key={stat.id} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-5 text-center backdrop-blur">
              <p className="font-heading text-2xl font-black text-amber-300 md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <div className="container">
          <SectionHeading
            label={home.featuredSection.label}
            title={home.featuredSection.title}
            description={home.featuredSection.description}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/inventory">View All Inventory <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <SectionHeading label={home.whyUsIntro.label} title={home.whyUsIntro.title} description={home.whyUsIntro.description} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {home.whyUsItems.map((item, index) => {
              const Icon = iconCycle[index % iconCycle.length];

              return (
                <div key={item.id} className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="gradient-primary py-16 text-center md:py-20">
        <div className="container max-w-2xl">
          <CreditCard className="mx-auto mb-4 h-10 w-10 text-primary-foreground opacity-80" />
          <h2 className="font-heading text-3xl font-bold text-primary-foreground md:text-4xl">{home.financeCta.title}</h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-primary-foreground/80">{home.financeCta.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to={home.financeCta.primaryCtaLink}>{home.financeCta.primaryCtaLabel}</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
              <a href={home.financeCta.secondaryCtaLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> {home.financeCta.secondaryCtaLabel}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <SectionHeading
            label={home.testimonialsIntro.label}
            title={home.testimonialsIntro.title}
            description={home.testimonialsIntro.description}
          />
          <div className="grid gap-6 md:grid-cols-3">
            {home.testimonials.map((testimonial) => (
              <div key={testimonial.id} className="flex flex-col rounded-xl border border-border bg-card p-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">"{testimonial.text}"</p>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <div className="container max-w-3xl">
          <SectionHeading label={home.faqIntro.label} title={home.faqIntro.title} description={home.faqIntro.description} />
          <Accordion type="single" collapsible className="w-full">
            {home.faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left font-heading text-sm font-semibold md:text-base">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">{home.finalCta.title}</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">{home.finalCta.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link to={home.finalCta.primaryCtaLink}>{home.finalCta.primaryCtaLabel}</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to={home.finalCta.secondaryCtaLink || "/contact"}>{home.finalCta.secondaryCtaLabel || "Contact Us"}</Link></Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
