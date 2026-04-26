import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import { PageError, PageLoader } from "@/components/PageState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateInquiry, useVehicles } from "@/hooks/use-site-data";
import { formatPrice } from "@/data/vehicles";

const galleryImages = [
  "/images/photo_2026-04-24_19-51-31.jpg",
  "/images/photo_2026-04-24_19-51-31 (2).jpg",
  "/images/photo_2026-04-24_19-51-31 (3).jpg",
  "/images/photo_2026-04-24_19-51-32.jpg",
  "/images/photo_2026-04-24_19-51-32 (2).jpg",
  "/images/photo_2026-04-24_19-51-32 (3).jpg",
  "/images/photo_2026-04-24_19-52-16.jpg",
  "/images/photo_2026-04-25_15-12-05.jpg",
];

const availabilityLabels: Record<string, string> = {
  "in-stock": "Available Now",
  "on-order": "Available on Order",
  "sold-out": "Sold Out",
};

const availabilityClasses: Record<string, string> = {
  "in-stock": "bg-emerald-100 text-emerald-800",
  "on-order": "bg-amber-100 text-amber-800",
  "sold-out": "bg-rose-100 text-rose-800",
};

const Gallery = () => {
  const { toast } = useToast();
  const vehiclesQuery = useVehicles();
  const createInquiry = useCreateInquiry();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    productId: "",
    quantity: "1",
    note: "",
  });

  const products = vehiclesQuery.data || [];

  const productsWithImages = useMemo(
    () =>
      products.map((vehicle, index) => ({
        ...vehicle,
        galleryImage:
          vehicle.image && vehicle.image !== "/placeholder.svg"
            ? vehicle.image
            : galleryImages[index % galleryImages.length],
      })),
    [products],
  );

  if (vehiclesQuery.isLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (vehiclesQuery.isError || !vehiclesQuery.data) {
    return (
      <Layout>
        <PageError message={vehiclesQuery.error?.message || "Gallery data could not be loaded."} />
      </Layout>
    );
  }

  const selectedProduct = products.find((product) => product.id === form.productId);

  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.productId) {
      toast({ title: "Please fill in your name, phone, and product.", variant: "destructive" });
      return;
    }

    try {
      await createInquiry.mutateAsync({
        name: form.name,
        phone: form.phone,
        email: form.email,
        subject: "order-request",
        vehicleName: selectedProduct?.name,
        message: `Order request\nProduct: ${selectedProduct?.name || "N/A"}\nQuantity: ${form.quantity}\nAvailability: ${selectedProduct ? availabilityLabels[selectedProduct.availability] : "N/A"}\nNote: ${form.note || "None"}`,
      });

      toast({
        title: "Order request sent",
        description: "Our team will contact you shortly to confirm stock and delivery details.",
      });

      setForm({
        name: "",
        phone: "",
        email: "",
        productId: "",
        quantity: "1",
        note: "",
      });
    } catch (submitError) {
      toast({ title: (submitError as Error).message, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <section className="bg-surface py-12 md:py-16">
        <div className="container">
          <SectionHeading
            label="Gallery"
            title="Products and Availability"
            description="Browse available motorcycles and Bajaj vehicles with quick descriptions, current availability, and send an order request instantly."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productsWithImages.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="aspect-[4/3] bg-muted">
                  <img src={product.galleryImage} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-heading text-lg font-bold text-foreground">{product.name}</h3>
                    <Badge className={availabilityClasses[product.availability]}>
                      {availabilityLabels[product.availability]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <p className="text-base font-bold text-primary">{formatPrice(product.price)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container max-w-3xl">
          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <h2 className="font-heading text-2xl font-bold text-foreground">Place an Order Request</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Select your product and we will confirm availability, payment options, and delivery timeline.
            </p>

            <form onSubmit={submitOrder} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Full Name *"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
                <Input
                  placeholder="Phone Number *"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </div>
              <Input
                placeholder="Email (optional)"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Select value={form.productId} onValueChange={(value) => setForm({ ...form, productId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Product *" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {availabilityLabels[product.availability]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                  placeholder="Quantity"
                />
              </div>

              {selectedProduct && (
                <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  Availability status: <span className="font-semibold text-foreground">{availabilityLabels[selectedProduct.availability]}</span>
                </div>
              )}

              <Textarea
                rows={4}
                placeholder="Any note for your order (color, model preference, delivery location, etc.)"
                value={form.note}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
              />

              <Button type="submit" size="lg" className="w-full" disabled={createInquiry.isPending}>
                {createInquiry.isPending ? "Submitting..." : "Submit Order Request"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
