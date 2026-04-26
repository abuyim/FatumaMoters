const SectionHeading = ({ label, title, description }: { label?: string; title: string; description?: string }) => (
  <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
    {label && <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">{label}</p>}
    <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
    {description && <p className="mt-3 text-base text-muted-foreground md:text-lg">{description}</p>}
  </div>
);

export default SectionHeading;
