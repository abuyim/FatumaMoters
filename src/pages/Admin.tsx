import { useEffect, useMemo, useState } from "react";
import { LogOut, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateVehicle,
  useDeleteInquiry,
  useDeleteVehicle,
  useInquiries,
  useSiteContent,
  useUpdateSiteContent,
  useUpdateVehicle,
  useVehicles,
} from "@/hooks/use-site-data";
import { PageError, PageLoader } from "@/components/PageState";
import { adminAuth, api } from "@/lib/api";
import type {
  FeatureItem,
  FaqItem,
  HeroSlide,
  Inquiry,
  ServiceItem,
  SiteContent,
  StatItem,
  Testimonial,
  Vehicle,
} from "@/types/site";

type CollectionItem = HeroSlide | StatItem | FeatureItem | Testimonial | FaqItem | ServiceItem;

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const parseList = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const CollectionEditor = <T extends CollectionItem>({
  title,
  description,
  items,
  onChange,
  createItem,
  renderFields,
}: {
  title: string;
  description: string;
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderFields: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) => (
  <section className="rounded-3xl border border-border bg-card p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button type="button" onClick={() => onChange([...items, createItem()])}>
        <Plus className="mr-2 h-4 w-4" /> Add Item
      </Button>
    </div>

    <div className="mt-6 space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="rounded-2xl border border-border bg-background p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">
              Item {index + 1} <span className="font-normal text-muted-foreground">({item.id})</span>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
          {renderFields(item, (patch) =>
            onChange(items.map((entry) => (entry.id === item.id ? { ...entry, ...patch } : entry))),
          )}
        </div>
      ))}
    </div>
  </section>
);

const JsonSectionEditor = ({
  title,
  description,
  value,
  onApply,
}: {
  title: string;
  description: string;
  value: unknown;
  onApply: (nextValue: unknown) => void;
}) => {
  const [draft, setDraft] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setDraft(JSON.stringify(value, null, 2));
  }, [value]);

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="font-heading text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <Textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="mt-4 min-h-[18rem] font-mono text-sm"
      />
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          onClick={() => {
            try {
              onApply(JSON.parse(draft));
              toast({ title: `${title} draft updated.` });
            } catch {
              toast({ title: "Invalid JSON.", variant: "destructive" });
            }
          }}
        >
          <Save className="mr-2 h-4 w-4" /> Apply Draft Changes
        </Button>
      </div>
    </section>
  );
};

const VehicleFields = ({
  vehicle,
  onChange,
}: {
  vehicle: Vehicle;
  onChange: (vehicle: Vehicle) => void;
}) => (
  <div className="mt-4 grid gap-4 md:grid-cols-2">
    <Input placeholder="Name" value={vehicle.name} onChange={(event) => onChange({ ...vehicle, name: event.target.value })} />
    <Input placeholder="Category" value={vehicle.category} onChange={(event) => onChange({ ...vehicle, category: event.target.value })} />
    <Input placeholder="Image URL" value={vehicle.image} onChange={(event) => onChange({ ...vehicle, image: event.target.value })} />
    <Input placeholder="Price" type="number" value={vehicle.price} onChange={(event) => onChange({ ...vehicle, price: Number(event.target.value) })} />
    <Input placeholder="Type: motorcycle or bajaj" value={vehicle.type} onChange={(event) => onChange({ ...vehicle, type: event.target.value as Vehicle["type"] })} />
    <Input placeholder="Availability" value={vehicle.availability} onChange={(event) => onChange({ ...vehicle, availability: event.target.value as Vehicle["availability"] })} />
    <Input placeholder="Engine" value={vehicle.specs.engine} onChange={(event) => onChange({ ...vehicle, specs: { ...vehicle.specs, engine: event.target.value } })} />
    <Input placeholder="Power" value={vehicle.specs.power} onChange={(event) => onChange({ ...vehicle, specs: { ...vehicle.specs, power: event.target.value } })} />
    <Input placeholder="Fuel Capacity" value={vehicle.specs.fuelCapacity} onChange={(event) => onChange({ ...vehicle, specs: { ...vehicle.specs, fuelCapacity: event.target.value } })} />
    <Input placeholder="Weight" value={vehicle.specs.weight} onChange={(event) => onChange({ ...vehicle, specs: { ...vehicle.specs, weight: event.target.value } })} />
    <Input placeholder="Transmission" value={vehicle.specs.transmission} onChange={(event) => onChange({ ...vehicle, specs: { ...vehicle.specs, transmission: event.target.value } })} />
    <Input placeholder="Popular: true or false" value={String(Boolean(vehicle.popular))} onChange={(event) => onChange({ ...vehicle, popular: event.target.value === "true" })} />
    <div className="md:col-span-2">
      <Textarea placeholder="Description" value={vehicle.description} onChange={(event) => onChange({ ...vehicle, description: event.target.value })} />
    </div>
    <div className="md:col-span-2">
      <Textarea
        placeholder="Features, one per line"
        value={vehicle.features.join("\n")}
        onChange={(event) => onChange({ ...vehicle, features: parseList(event.target.value) })}
      />
    </div>
  </div>
);

const InquiriesPanel = ({
  inquiries,
  onDelete,
  isDeleting,
}: {
  inquiries: Inquiry[];
  onDelete: (inquiryId: string) => void;
  isDeleting: boolean;
}) => (
  <section className="rounded-3xl border border-border bg-card p-6">
    <h2 className="font-heading text-2xl font-bold text-foreground">Incoming Inquiries</h2>
    <p className="mt-1 text-sm text-muted-foreground">Messages submitted from the contact page and product inquiry forms.</p>
    <div className="mt-6 space-y-4">
      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-background p-5 text-sm text-muted-foreground">No inquiries yet.</div>
      ) : (
        inquiries.map((inquiry) => (
          <div key={inquiry.id} className="rounded-2xl border border-border bg-background p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">{inquiry.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {inquiry.phone} {inquiry.email ? `• ${inquiry.email}` : ""}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {inquiry.subject} • {new Date(inquiry.createdAt).toLocaleString()}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => onDelete(inquiry.id)} disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" /> Remove
              </Button>
            </div>
            {inquiry.vehicleName ? (
              <p className="mt-3 text-sm font-medium text-foreground">Vehicle: {inquiry.vehicleName}</p>
            ) : null}
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{inquiry.message}</p>
          </div>
        ))
      )}
    </div>
  </section>
);

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const contentQuery = useSiteContent();
  const vehiclesQuery = useVehicles();
  const inquiriesQuery = useInquiries();
  const updateContentMutation = useUpdateSiteContent();
  const updateVehicleMutation = useUpdateVehicle();
  const createVehicleMutation = useCreateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();
  const deleteInquiryMutation = useDeleteInquiry();

  const [draftContent, setDraftContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    if (contentQuery.data) {
      setDraftContent(structuredClone(contentQuery.data));
    }
  }, [contentQuery.data]);

  const blankVehicle = useMemo<Vehicle>(
    () => ({
      id: "",
      name: "",
      type: "motorcycle",
      category: "",
      price: 0,
      image: "/placeholder.svg",
      availability: "in-stock",
      description: "",
      popular: false,
      specs: {
        engine: "",
        power: "",
        fuelCapacity: "",
        weight: "",
        transmission: "",
      },
      features: [],
    }),
    [],
  );
  const [newVehicle, setNewVehicle] = useState<Vehicle>(blankVehicle);

  if (contentQuery.isLoading || vehiclesQuery.isLoading || inquiriesQuery.isLoading || !draftContent) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (contentQuery.isError || vehiclesQuery.isError || inquiriesQuery.isError) {
    return (
      <Layout>
        <PageError
          message={
            contentQuery.error?.message ||
            vehiclesQuery.error?.message ||
            inquiriesQuery.error?.message ||
            "Admin data could not be loaded."
          }
        />
      </Layout>
    );
  }

  const saveContent = async () => {
    try {
      await updateContentMutation.mutateAsync(draftContent);
      toast({ title: "Content saved." });
    } catch (error) {
      toast({ title: (error as Error).message, variant: "destructive" });
    }
  };

  const logout = async () => {
    try {
      await api.logoutAdmin();
    } catch {
      // Ignore logout API errors and clear local token anyway.
    } finally {
      adminAuth.clearToken();
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <Layout>
      <section className="border-b border-border bg-surface py-14">
        <div className="container flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Admin Panel</p>
            <h1 className="mt-3 font-heading text-4xl font-black text-foreground">Site content and inventory control</h1>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              Manage homepage sections, edit page copy, update hero slides, maintain the vehicle inventory, and review contact inquiries.
            </p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
            <Button type="button" variant="outline" onClick={() => setDraftContent(structuredClone(contentQuery.data!))}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reset Draft
            </Button>
            <Button type="button" onClick={saveContent} disabled={updateContentMutation.isPending}>
              <Save className="mr-2 h-4 w-4" /> Save All Page Content
            </Button>
          </div>
        </div>
      </section>

      <div className="container space-y-8 py-10">
        <CollectionEditor
          title="Hero Slider"
          description="Mixed image and video slides used on the homepage hero."
          items={draftContent.home.heroSlides}
          onChange={(heroSlides) => setDraftContent({ ...draftContent, home: { ...draftContent.home, heroSlides } })}
          createItem={() => ({
            id: createId("hero"),
            mediaType: "image",
            mediaUrl: "/placeholder.svg",
            eyebrow: "",
            title: "",
            description: "",
            primaryCtaLabel: "",
            primaryCtaLink: "/inventory",
            secondaryCtaLabel: "",
            secondaryCtaLink: "/contact",
          })}
          renderFields={(item, update) => (
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Eyebrow" value={item.eyebrow} onChange={(event) => update({ eyebrow: event.target.value })} />
              <Input placeholder="Media type: image or video" value={item.mediaType} onChange={(event) => update({ mediaType: event.target.value as HeroSlide["mediaType"] })} />
              <Input placeholder="Media URL" value={item.mediaUrl} onChange={(event) => update({ mediaUrl: event.target.value })} className="md:col-span-2" />
              <Input placeholder="Title" value={item.title} onChange={(event) => update({ title: event.target.value })} className="md:col-span-2" />
              <Textarea placeholder="Description" value={item.description} onChange={(event) => update({ description: event.target.value })} className="md:col-span-2" />
              <Input placeholder="Primary CTA label" value={item.primaryCtaLabel} onChange={(event) => update({ primaryCtaLabel: event.target.value })} />
              <Input placeholder="Primary CTA link" value={item.primaryCtaLink} onChange={(event) => update({ primaryCtaLink: event.target.value })} />
              <Input placeholder="Secondary CTA label" value={item.secondaryCtaLabel} onChange={(event) => update({ secondaryCtaLabel: event.target.value })} />
              <Input placeholder="Secondary CTA link" value={item.secondaryCtaLink} onChange={(event) => update({ secondaryCtaLink: event.target.value })} />
            </div>
          )}
        />

        <CollectionEditor
          title="Home Stats"
          description="Edit the trust metrics shown below the hero slider."
          items={draftContent.home.stats}
          onChange={(stats) => setDraftContent({ ...draftContent, home: { ...draftContent.home, stats } })}
          createItem={() => ({ id: createId("stat"), value: "", label: "" })}
          renderFields={(item, update) => (
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Value" value={item.value} onChange={(event) => update({ value: event.target.value })} />
              <Input placeholder="Label" value={item.label} onChange={(event) => update({ label: event.target.value })} />
            </div>
          )}
        />

        <CollectionEditor
          title="Why Us Items"
          description="Homepage selling points shown in the card grid."
          items={draftContent.home.whyUsItems}
          onChange={(whyUsItems) => setDraftContent({ ...draftContent, home: { ...draftContent.home, whyUsItems } })}
          createItem={() => ({ id: createId("why"), title: "", description: "" })}
          renderFields={(item, update) => (
            <div className="grid gap-4">
              <Input placeholder="Title" value={item.title} onChange={(event) => update({ title: event.target.value })} />
              <Textarea placeholder="Description" value={item.description} onChange={(event) => update({ description: event.target.value })} />
            </div>
          )}
        />

        <CollectionEditor
          title="Testimonials"
          description="Homepage customer reviews."
          items={draftContent.home.testimonials}
          onChange={(testimonials) => setDraftContent({ ...draftContent, home: { ...draftContent.home, testimonials } })}
          createItem={() => ({ id: createId("testimonial"), name: "", role: "", text: "", rating: 5 })}
          renderFields={(item, update) => (
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Name" value={item.name} onChange={(event) => update({ name: event.target.value })} />
              <Input placeholder="Role" value={item.role} onChange={(event) => update({ role: event.target.value })} />
              <Input placeholder="Rating" type="number" value={item.rating} onChange={(event) => update({ rating: Number(event.target.value) })} />
              <div />
              <Textarea placeholder="Quote" value={item.text} onChange={(event) => update({ text: event.target.value })} className="md:col-span-2" />
            </div>
          )}
        />

        <CollectionEditor
          title="FAQs"
          description="Homepage frequently asked questions."
          items={draftContent.home.faqs}
          onChange={(faqs) => setDraftContent({ ...draftContent, home: { ...draftContent.home, faqs } })}
          createItem={() => ({ id: createId("faq"), question: "", answer: "" })}
          renderFields={(item, update) => (
            <div className="grid gap-4">
              <Input placeholder="Question" value={item.question} onChange={(event) => update({ question: event.target.value })} />
              <Textarea placeholder="Answer" value={item.answer} onChange={(event) => update({ answer: event.target.value })} />
            </div>
          )}
        />

        <CollectionEditor
          title="Services"
          description="Service cards shown on the services page."
          items={draftContent.servicesPage.services}
          onChange={(services) => setDraftContent({ ...draftContent, servicesPage: { ...draftContent.servicesPage, services } })}
          createItem={() => ({ id: createId("service"), title: "", description: "", details: [] })}
          renderFields={(item, update) => (
            <div className="grid gap-4">
              <Input placeholder="Title" value={item.title} onChange={(event) => update({ title: event.target.value })} />
              <Textarea placeholder="Description" value={item.description} onChange={(event) => update({ description: event.target.value })} />
              <Textarea
                placeholder="Details, one per line"
                value={item.details.join("\n")}
                onChange={(event) => update({ details: parseList(event.target.value) })}
              />
            </div>
          )}
        />

        <CollectionEditor
          title="About Values"
          description="Values displayed on the about page."
          items={draftContent.aboutPage.values}
          onChange={(values) => setDraftContent({ ...draftContent, aboutPage: { ...draftContent.aboutPage, values } })}
          createItem={() => ({ id: createId("value"), title: "", description: "" })}
          renderFields={(item, update) => (
            <div className="grid gap-4">
              <Input placeholder="Title" value={item.title} onChange={(event) => update({ title: event.target.value })} />
              <Textarea placeholder="Description" value={item.description} onChange={(event) => update({ description: event.target.value })} />
            </div>
          )}
        />

        <JsonSectionEditor
          title="Site Settings"
          description="Brand name, contact details, social media links, map/location link, footer copy, and vehicle categories."
          value={draftContent.site}
          onApply={(nextValue) => setDraftContent({ ...draftContent, site: nextValue as SiteContent["site"] })}
        />

        <JsonSectionEditor
          title="Home Text Sections"
          description="Featured inventory intro, why-us intro, finance CTA, testimonial intro, FAQ intro, and final CTA."
          value={{
            featuredSection: draftContent.home.featuredSection,
            whyUsIntro: draftContent.home.whyUsIntro,
            financeCta: draftContent.home.financeCta,
            testimonialsIntro: draftContent.home.testimonialsIntro,
            faqIntro: draftContent.home.faqIntro,
            finalCta: draftContent.home.finalCta,
          }}
          onApply={(nextValue) =>
            setDraftContent({
              ...draftContent,
              home: {
                ...draftContent.home,
                ...(nextValue as Partial<SiteContent["home"]>),
              },
            })
          }
        />

        <JsonSectionEditor
          title="Inventory Page Copy"
          description="The heading block used on the inventory page."
          value={draftContent.inventoryPage}
          onApply={(nextValue) => setDraftContent({ ...draftContent, inventoryPage: nextValue as SiteContent["inventoryPage"] })}
        />

        <JsonSectionEditor
          title="About Page Sections"
          description="Hero, story, mission, values intro, and about CTA."
          value={{
            hero: draftContent.aboutPage.hero,
            story: draftContent.aboutPage.story,
            mission: draftContent.aboutPage.mission,
            valuesIntro: draftContent.aboutPage.valuesIntro,
            cta: draftContent.aboutPage.cta,
          }}
          onApply={(nextValue) =>
            setDraftContent({
              ...draftContent,
              aboutPage: {
                ...draftContent.aboutPage,
                ...(nextValue as Partial<SiteContent["aboutPage"]>),
              },
            })
          }
        />

        <JsonSectionEditor
          title="Contact Page Sections"
          description="Hero, details intro, form copy, map label, and subject options."
          value={draftContent.contactPage}
          onApply={(nextValue) => setDraftContent({ ...draftContent, contactPage: nextValue as SiteContent["contactPage"] })}
        />

        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-heading text-2xl font-bold text-foreground">Inventory CRUD</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add, update, or delete vehicles shown across the inventory and product pages.</p>

          <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-5">
            <h3 className="font-heading text-lg font-semibold">Add New Vehicle</h3>
            <VehicleFields vehicle={newVehicle} onChange={setNewVehicle} />
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                disabled={createVehicleMutation.isPending}
                onClick={() => {
                  createVehicleMutation.mutate({ ...newVehicle, id: createId("vehicle") });
                  setNewVehicle(blankVehicle);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Vehicle
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {(vehiclesQuery.data || []).map((vehicle) => (
              <VehicleRow
                key={vehicle.id}
                vehicle={vehicle}
                onSave={(nextVehicle) => updateVehicleMutation.mutate(nextVehicle)}
                onDelete={(vehicleId) => deleteVehicleMutation.mutate(vehicleId)}
                isSaving={updateVehicleMutation.isPending || deleteVehicleMutation.isPending}
              />
            ))}
          </div>
        </section>

        <InquiriesPanel
          inquiries={inquiriesQuery.data || []}
          onDelete={(inquiryId) => deleteInquiryMutation.mutate(inquiryId)}
          isDeleting={deleteInquiryMutation.isPending}
        />
      </div>
    </Layout>
  );
};

const VehicleRow = ({
  vehicle,
  onSave,
  onDelete,
  isSaving,
}: {
  vehicle: Vehicle;
  onSave: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
  isSaving: boolean;
}) => {
  const [draftVehicle, setDraftVehicle] = useState(vehicle);

  useEffect(() => {
    setDraftVehicle(vehicle);
  }, [vehicle]);

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{vehicle.name}</p>
          <p className="text-xs text-muted-foreground">{vehicle.id}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={() => onSave(draftVehicle)} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onDelete(vehicle.id)} disabled={isSaving}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
      <VehicleFields vehicle={draftVehicle} onChange={setDraftVehicle} />
    </div>
  );
};

export default Admin;
