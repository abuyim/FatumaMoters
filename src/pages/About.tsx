import { Link } from "react-router-dom";
import { Target, Eye, Heart, Award, Users, Truck } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/use-site-data";
import { PageError, PageLoader } from "@/components/PageState";

const icons = [Target, Eye, Heart, Award, Users, Truck];

const About = () => {
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
        <PageError message={error?.message || "About page data could not be loaded."} />
      </Layout>
    );
  }

  const about = data.aboutPage;

  return (
    <Layout>
      <section className="gradient-hero py-16 text-charcoal-foreground md:py-24">
        <div className="container max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">{about.hero.label}</p>
          <h1 className="font-heading text-4xl font-extrabold md:text-5xl">{about.hero.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base opacity-80">{about.hero.description}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            <img src={about.story.imageUrl} alt={about.story.title} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">{about.story.label}</p>
            <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">{about.story.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{about.story.description}</p>
            {about.story.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-relaxed text-muted-foreground">{paragraph}</p>
            ))}
            <Button asChild className="mt-6"><Link to={about.story.buttonLink}>{about.story.buttonLabel}</Link></Button>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <div className="container max-w-3xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">{about.mission.label}</p>
          <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">{about.mission.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{about.mission.description}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <SectionHeading label={about.valuesIntro.label} title={about.valuesIntro.title} description={about.valuesIntro.description} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {about.values.map((value, index) => {
              const Icon = icons[index % icons.length];

              return (
                <div key={value.id} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="gradient-primary py-16 text-center">
        <div className="container max-w-xl">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground md:text-4xl">{about.cta.title}</h2>
          <p className="mt-3 text-primary-foreground/80">{about.cta.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="secondary" size="lg"><Link to={about.cta.primaryCtaLink}>{about.cta.primaryCtaLabel}</Link></Button>
            <Button asChild size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10"><Link to={about.cta.secondaryCtaLink || "/contact"}>{about.cta.secondaryCtaLabel || "Contact Us"}</Link></Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
