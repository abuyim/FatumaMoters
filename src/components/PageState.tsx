export const PageLoader = () => (
  <div className="container py-24 text-center">
    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Loading content</p>
  </div>
);

export const PageError = ({ message }: { message: string }) => (
  <div className="container py-24 text-center">
    <h1 className="font-heading text-2xl font-bold text-foreground">Content unavailable</h1>
    <p className="mt-3 text-muted-foreground">{message}</p>
  </div>
);
