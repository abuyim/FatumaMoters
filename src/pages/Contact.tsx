import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateInquiry, useSiteContent } from "@/hooks/use-site-data";
import { PageError, PageLoader } from "@/components/PageState";

const Contact = () => {
  const [searchParams] = useSearchParams();
  const vehicleParam = searchParams.get("vehicle") || "";
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useSiteContent();
  const createInquiry = useCreateInquiry();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: vehicleParam ? "vehicle-inquiry" : "",
    message: vehicleParam ? `I'm interested in the ${vehicleParam}. Please provide more details.` : "",
  });

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
        <PageError message={error?.message || "Contact page data could not be loaded."} />
      </Layout>
    );
  }

  const site = data.site;
  const contact = data.contactPage;
  const whatsappLink = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    try {
      await createInquiry.mutateAsync({
        ...form,
        vehicleName: vehicleParam,
      });
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (submitError) {
      toast({ title: (submitError as Error).message, variant: "destructive" });
    }
  };

  const setField = (key: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: event.target.value });

  return (
    <Layout>
      <section className="gradient-hero py-16 text-charcoal-foreground md:py-24">
        <div className="container max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">{contact.hero.label}</p>
          <h1 className="font-heading text-4xl font-extrabold md:text-5xl">{contact.hero.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base opacity-80">{contact.hero.description}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">{contact.detailsIntroTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{contact.detailsIntroDescription}</p>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Address</p>
                  <p className="text-sm text-muted-foreground">{site.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Phone</p>
                  <a href={`tel:${site.phone.replace(/\s+/g, "")}`} className="text-sm text-muted-foreground hover:text-foreground">{site.phone}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Email</p>
                  <a href={`mailto:${site.email}`} className="text-sm text-muted-foreground hover:text-foreground">{site.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Business Hours</p>
                  {site.businessHours.map((hour) => (
                    <p key={hour} className="text-sm text-muted-foreground">{hour}</p>
                  ))}
                </div>
              </div>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>

            <div className="overflow-hidden rounded-xl border border-border bg-muted">
              <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
                {contact.mapLabel}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-foreground">{contact.formTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{contact.formDescription}</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input placeholder="Full Name *" value={form.name} onChange={setField("name")} />
                  <Input placeholder="Email" type="email" value={form.email} onChange={setField("email")} />
                </div>
                <Input placeholder="Phone Number *" type="tel" value={form.phone} onChange={setField("phone")} />
                <Select value={form.subject} onValueChange={(value) => setForm({ ...form, subject: value })}>
                  <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                  <SelectContent>
                    {contact.subjectOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea placeholder="Your Message *" rows={5} value={form.message} onChange={setField("message")} />
                <Button type="submit" size="lg" className="w-full" disabled={createInquiry.isPending}>Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
