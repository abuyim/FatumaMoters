import { Link } from "react-router-dom";
import { ShoppingCart, Users, Search, Wrench, BookOpen, Briefcase, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/use-site-data";
import { PageError, PageLoader } from "@/components/PageState";

const serviceIcons = [ShoppingCart, Users, Search, Wrench, BookOpen, Briefcase];

const Services = () => {
  const { data, isLoading, isError, error } = useSiteContent();

  if (isLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (isError || !data) {
    return (
      <Layout>
        <PageError message={error?.message || "Services page data could not be loaded."} />
      </Layout>
    );
  }

  const servicesPage = data.servicesPage;

  return (
    <Layout>
      <section className="gradient-hero py-16 text-charcoal-foreground md:py-24">
        <div className="container max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">{servicesPage.hero.label}</p>
          <h1 className="font-heading text-4xl font-extrabold md:text-5xl">{servicesPage.hero.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base opacity-80">{servicesPage.hero.description}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {servicesPage.services.map((service, index) => {
              const Icon = serviceIcons[index % serviceIcons.length];

              return (
                <div key={service.id} className="flex flex-col rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground">{service.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                  <ul className="mt-4 space-y-1.5">
                    {service.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ChevronRight className="h-3 w-3 text-primary" /> {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="gradient-primary py-16 text-center">
        <div className="container max-w-xl">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground md:text-4xl">{servicesPage.cta.title}</h2>
          <p className="mt-3 text-primary-foreground/80">{servicesPage.cta.description}</p>
          <Button asChild variant="secondary" size="lg" className="mt-8"><Link to={servicesPage.cta.primaryCtaLink}>{servicesPage.cta.primaryCtaLabel}</Link></Button>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
