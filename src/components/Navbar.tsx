import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/use-site-data";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Inventory", to: "/inventory" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
  { label: "Admin", to: "/admin" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { data } = useSiteContent();
  const site = data?.site;
  const phoneHref = (site?.phone || "+251911223344").replace(/\s+/g, "");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between md:h-18">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-foreground">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
            {site?.shortName || "FM"}
          </span>
          {site?.name || "FatumaMotors"}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                pathname === link.to ? "bg-accent text-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a href={`tel:${phoneHref}`} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <Phone className="h-4 w-4" />
            {site?.phone || "+251 911 223 344"}
          </a>
          <Button asChild size="sm">
            <Link to="/contact">Get a Quote</Link>
          </Button>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === link.to ? "bg-accent text-foreground" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <a href={`tel:${phoneHref}`} className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" /> {site?.phone || "+251 911 223 344"}
              </a>
              <Button asChild size="sm" className="mx-3">
                <Link to="/contact" onClick={() => setOpen(false)}>Get a Quote</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
