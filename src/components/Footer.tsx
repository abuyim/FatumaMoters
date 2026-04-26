import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-data";

const Footer = () => {
  const { data } = useSiteContent();
  const site = data?.site;
  const whatsappLink = `https://wa.me/${(site?.whatsapp || "+251911223344").replace(/\D/g, "")}`;
  const phoneHref = (site?.phone || "+251911223344").replace(/\s+/g, "");

  return (
    <footer className="border-t border-border bg-charcoal text-charcoal-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
                {site?.shortName || "FM"}
              </span>
              {site?.name || "FatumaMotors"}
            </Link>
            <p className="text-sm leading-relaxed opacity-70">
              {site?.footerDescription || "Your trusted partner for motorcycles, Bajaj three-wheelers, and transport solutions."}
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider opacity-60">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "View Inventory", to: "/inventory" },
                { label: "About Us", to: "/about" },
                { label: "Our Services", to: "/services" },
                { label: "Contact Us", to: "/contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm opacity-70 transition-opacity hover:opacity-100">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider opacity-60">Vehicles</h4>
            <ul className="space-y-2.5">
              {(site?.vehicleCategories || []).map((category) => (
                <li key={category}>
                  <Link to="/inventory" className="text-sm opacity-70 transition-opacity hover:opacity-100">{category}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider opacity-60">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm opacity-70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {site?.address || "Bole Road, Addis Ababa, Ethiopia"}
              </li>
              <li className="flex items-center gap-2.5 text-sm opacity-70">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${phoneHref}`}>{site?.phone || "+251 911 223 344"}</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm opacity-70">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${site?.email || "info@fatumamotors.com"}`}>{site?.email || "info@fatumamotors.com"}</a>
              </li>
              <li className="flex items-start gap-2.5 text-sm opacity-70">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-1">
                  {(site?.businessHours || []).map((hour) => (
                    <p key={hour}>{hour}</p>
                  ))}
                </div>
              </li>
              <li>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-charcoal-foreground/10 pt-6 text-center text-xs opacity-50">
          © {new Date().getFullYear()} {site?.name || "FatumaMotors"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
