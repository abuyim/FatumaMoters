import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MessageCircle, Phone, ChevronLeft, Check } from "lucide-react";
import { formatPrice } from "@/data/vehicles";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateInquiry, useSiteContent, useVehicles } from "@/hooks/use-site-data";
import { PageError, PageLoader } from "@/components/PageState";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const vehiclesQuery = useVehicles();
  const contentQuery = useSiteContent();
  const createInquiry = useCreateInquiry();

  if (vehiclesQuery.isLoading || contentQuery.isLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (vehiclesQuery.isError || contentQuery.isError || !vehiclesQuery.data || !contentQuery.data) {
    return (
      <Layout>
        <PageError message={vehiclesQuery.error?.message || contentQuery.error?.message || "Vehicle data could not be loaded."} />
      </Layout>
    );
  }

  const vehicle = vehiclesQuery.data.find((entry) => entry.id === id);
  const site = contentQuery.data.site;

  if (!vehicle) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-heading text-2xl font-bold">Vehicle Not Found</h1>
          <p className="mt-2 text-muted-foreground">The vehicle you're looking for doesn't exist.</p>
          <Button asChild className="mt-6"><Link to="/inventory">Back to Inventory</Link></Button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "Please fill in your name and phone number.", variant: "destructive" });
      return;
    }

    try {
      await createInquiry.mutateAsync({
        name: form.name,
        email: "",
        phone: form.phone,
        subject: "vehicle-inquiry",
        message: form.message || `I am interested in the ${vehicle.name}.`,
        vehicleName: vehicle.name,
      });
      toast({ title: "Inquiry sent!", description: "Our team will contact you shortly." });
      setForm({ name: "", phone: "", message: "" });
    } catch (submitError) {
      toast({ title: (submitError as Error).message, variant: "destructive" });
    }
  };

  const availColor =
    vehicle.availability === "in-stock"
      ? "bg-emerald-100 text-emerald-800"
      : vehicle.availability === "on-order"
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-800";

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <Link to="/inventory" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to Inventory
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <img src={vehicle.image} alt={vehicle.name} className="aspect-[4/3] w-full object-cover" />
          </div>

          <div>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{vehicle.category} · {vehicle.type === "bajaj" ? "Bajaj" : "Motorcycle"}</p>
                <h1 className="mt-1 font-heading text-3xl font-bold text-foreground">{vehicle.name}</h1>
              </div>
              <Badge className={availColor}>
                {vehicle.availability === "in-stock" ? "In Stock" : vehicle.availability === "on-order" ? "On Order" : "Sold Out"}
              </Badge>
            </div>

            <p className="mt-4 text-3xl font-bold text-primary">{formatPrice(vehicle.price)}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{vehicle.description}</p>

            <div className="mt-6">
              <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">Specifications</h3>
              <div className="overflow-hidden rounded-lg border border-border">
                {Object.entries(vehicle.specs).map(([key, value], index) => (
                  <div key={key} className={`flex justify-between px-4 py-2.5 text-sm ${index % 2 === 0 ? "bg-muted/50" : ""}`}>
                    <span className="font-medium capitalize text-foreground">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">Key Features</h3>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {vehicle.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" /> {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in the ${vehicle.name}`)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Us
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={`tel:${site.phone.replace(/\s+/g, "")}`}><Phone className="mr-2 h-4 w-4" /> Call Now</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-xl rounded-xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-heading text-xl font-bold text-foreground">Inquire About This Vehicle</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fill in your details and we'll get back to you promptly.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input placeholder="Your Name *" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input placeholder="Phone Number *" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <Textarea placeholder="Message (optional)" rows={3} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
            <Button type="submit" className="w-full" disabled={createInquiry.isPending}>Send Inquiry</Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
