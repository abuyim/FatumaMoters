import { useEffect, useMemo, useState } from "react";
import { 
  LayoutDashboard, 
  Image, 
  BarChart3, 
  Users, 
  HelpCircle, 
  Wrench, 
  Award, 
  Settings, 
  ShoppingCart, 
  MessageSquare, 
  LogOut, 
  Plus, 
  Pencil, 
  Trash2,
  Save,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle
} from "@/components/ui/sheet";
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

// Sidebar navigation items
const navItems = [
  { id: "home", label: "Home Page", icon: LayoutDashboard },
  { id: "about", label: "About Page", icon: Award },
  { id: "services", label: "Services Page", icon: Wrench },
  { id: "inventory", label: "Inventory", icon: ShoppingCart },
  { id: "inquiries", label: "Inquiries", icon: MessageSquare },
  { id: "settings", label: "Site Settings", icon: Settings },
];

// Hero Slide Form Component
const HeroSlideForm = ({ item, onSave, onCancel }: { item: HeroSlide; onSave: (item: HeroSlide) => void; onCancel: () => void }) => {
  const [form, setForm] = useState(item);
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Eyebrow</label>
          <Input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Media Type</label>
          <Input value={form.mediaType} onChange={(e) => setForm({ ...form, mediaType: e.target.value as HeroSlide["mediaType"] })} className="mt-1" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Media URL</label>
        <Input value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Primary CTA Label</label>
          <Input value={form.primaryCtaLabel} onChange={(e) => setForm({ ...form, primaryCtaLabel: e.target.value })} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Primary CTA Link</label>
          <Input value={form.primaryCtaLink} onChange={(e) => setForm({ ...form, primaryCtaLink: e.target.value })} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Secondary CTA Label</label>
          <Input value={form.secondaryCtaLabel} onChange={(e) => setForm({ ...form, secondaryCtaLabel: e.target.value })} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Secondary CTA Link</label>
          <Input value={form.secondaryCtaLink} onChange={(e) => setForm({ ...form, secondaryCtaLink: e.target.value })} className="mt-1" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(form)}>Save</Button>
      </div>
    </div>
  );
};

// Stat Item Form
const StatForm = ({ item, onSave, onCancel }: { item: StatItem; onSave: (item: StatItem) => void; onCancel: () => void }) => {
  const [form, setForm] = useState(item);
  return (
    <div className="grid gap-4">
      <div>
        <label className="text-sm font-medium">Value</label>
        <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Label</label>
        <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="mt-1" />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(form)}>Save</Button>
      </div>
    </div>
  );
};

// Feature/Why Us Item Form
const FeatureForm = ({ item, onSave, onCancel }: { item: FeatureItem; onSave: (item: FeatureItem) => void; onCancel: () => void }) => {
  const [form, setForm] = useState(item);
  return (
    <div className="grid gap-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(form)}>Save</Button>
      </div>
    </div>
  );
};

// Testimonial Form
const TestimonialForm = ({ item, onSave, onCancel }: { item: Testimonial; onSave: (item: Testimonial) => void; onCancel: () => void }) => {
  const [form, setForm] = useState(item);
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Role</label>
          <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Rating (1-5)</label>
        <Input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Quote</label>
        <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="mt-1" />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(form)}>Save</Button>
      </div>
    </div>
  );
};

// FAQ Form
const FaqForm = ({ item, onSave, onCancel }: { item: FaqItem; onSave: (item: FaqItem) => void; onCancel: () => void }) => {
  const [form, setForm] = useState(item);
  return (
    <div className="grid gap-4">
      <div>
        <label className="text-sm font-medium">Question</label>
        <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Answer</label>
        <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="mt-1" />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(form)}>Save</Button>
      </div>
    </div>
  );
};

// Service Form
const ServiceForm = ({ item, onSave, onCancel }: { item: ServiceItem; onSave: (item: ServiceItem) => void; onCancel: () => void }) => {
  const [form, setForm] = useState(item);
  return (
    <div className="grid gap-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Details (one per line)</label>
        <Textarea value={form.details.join("\n")} onChange={(e) => setForm({ ...form, details: parseList(e.target.value) })} className="mt-1" />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(form)}>Save</Button>
      </div>
    </div>
  );
};

// Vehicle Form
const VehicleForm = ({ vehicle, onSave, onCancel, isNew = false }: { vehicle: Vehicle; onSave: (vehicle: Vehicle) => void; onCancel: () => void; isNew?: boolean }) => {
  const [form, setForm] = useState(vehicle);
  return (
    <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Type</label>
          <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Price</label>
          <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="mt-1" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Image URL</label>
        <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Availability</label>
        <Input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-medium">Features (one per line)</label>
        <Textarea value={form.features.join("\n")} onChange={(e) => setForm({ ...form, features: parseList(e.target.value) })} className="mt-1" />
      </div>
      <div className="border-t pt-4">
        <label className="text-sm font-medium">Specifications</label>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <Input value={form.specs.engine} onChange={(e) => setForm({ ...form, specs: { ...form.specs, engine: e.target.value } })} placeholder="Engine" />
          <Input value={form.specs.power} onChange={(e) => setForm({ ...form, specs: { ...form.specs, power: e.target.value } })} placeholder="Power" />
          <Input value={form.specs.fuelCapacity} onChange={(e) => setForm({ ...form, specs: { ...form.specs, fuelCapacity: e.target.value } })} placeholder="Fuel Capacity" />
          <Input value={form.specs.weight} onChange={(e) => setForm({ ...form, specs: { ...form.specs, weight: e.target.value } })} placeholder="Weight" />
          <Input value={form.specs.transmission} onChange={(e) => setForm({ ...form, specs: { ...form.specs, transmission: e.target.value } })} placeholder="Transmission" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave({ ...form, id: form.id || createId("vehicle") })}>{isNew ? "Create" : "Save"}</Button>
      </div>
    </div>
  );
};

// Collection List with Dialog editing
const CollectionList = <T extends CollectionItem>({
  title,
  items,
  onChange,
  createItem,
  formComponent,
  emptyMessage = "No items yet"
}: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  formComponent: React.ComponentType<{ item: T; onSave: (item: T) => void; onCancel: () => void }>;
  emptyMessage?: string;
}) => {
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState<T>(createItem());

  const FormComponent = formComponent;

  const handleSave = (updated: T) => {
    if (editingItem) {
      onChange(items.map((item) => (item.id === editingItem.id ? updated : item)));
      setEditingItem(null);
    } else {
      onChange([...items, { ...updated, id: createId("hero") }]);
      setIsAddOpen(false);
      setNewItem(createItem());
    }
  };

  const getItemTitle = (item: T): string => {
    if ("name" in item) return item.name;
    if ("question" in item) return (item as unknown as FaqItem).question;
    if ("title" in item) return item.title;
    if ("value" in item) return (item as unknown as StatItem).value;
    return "Item";
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title} ({items.length})</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add {title}</DialogTitle>
            </DialogHeader>
            <FormComponent item={newItem} onSave={handleSave} onCancel={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-4 space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
              <div className="flex-1">
                <p className="font-medium">{getItemTitle(item)}</p>
                <p className="text-xs text-muted-foreground">{item.id}</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={editingItem?.id === item.id} onOpenChange={(open) => !open && setEditingItem(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                      <Pencil className="mr-1 h-3 w-3" /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit {title}</DialogTitle>
                    </DialogHeader>
                    <FormComponent item={editingItem!} onSave={handleSave} onCancel={() => setEditingItem(null)} />
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="sm" onClick={() => onChange(items.filter((i) => i.id !== item.id))}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// Main Admin Component
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
  const [activeSection, setActiveSection] = useState("home");
  const [vehicleSheetOpen, setVehicleSheetOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

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
      specs: { engine: "", power: "", fuelCapacity: "", weight: "", transmission: "" },
      features: [],
    }),
    [],
  );

  if (contentQuery.isLoading || vehiclesQuery.isLoading || inquiriesQuery.isLoading || !draftContent) {
    return (<Layout><PageLoader /></Layout>);
  }

  if (contentQuery.isError || vehiclesQuery.isError || inquiriesQuery.isError) {
    return (<Layout><PageError message={contentQuery.error?.message || vehiclesQuery.error?.message || inquiriesQuery.error?.message || "Admin data could not be loaded."} /></Layout>);
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
    try { await api.logoutAdmin(); } catch { /* ignore */ } finally {
      adminAuth.clearToken();
      navigate("/admin/login", { replace: true });
    }
  };

  const handleVehicleSave = (vehicle: Vehicle) => {
    if (editingVehicle) {
      updateVehicleMutation.mutate(vehicle);
    } else {
      createVehicleMutation.mutate({ ...vehicle, id: createId("vehicle") });
    }
    setVehicleSheetOpen(false);
    setEditingVehicle(null);
  };

  const openVehicleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleSheetOpen(true);
  };

  const openVehicleAdd = () => {
    setEditingVehicle(null);
    setVehicleSheetOpen(true);
  };

  return (
    <Layout>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-surface flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-heading text-xl font-bold">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">FatumaMotors</p>
          </div>
          
          <nav className="p-2 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  activeSection === item.id ? "bg-primary text-primary-foreground" : "hover:bg-background"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <Button variant="outline" className="w-full" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold">
                  {navItems.find((i) => i.id === activeSection)?.label || "Admin"}
                </h1>
                <p className="text-sm text-muted-foreground">Manage your {activeSection} content</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDraftContent(structuredClone(contentQuery.data!))}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
                <Button onClick={saveContent} disabled={updateContentMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </div>
            </div>

            {/* Home Page Sections */}
            {activeSection === "home" && (
              <div className="space-y-6">
                <CollectionList title="Hero Slides" items={draftContent.home.heroSlides} onChange={(heroSlides) => setDraftContent({ ...draftContent, home: { ...draftContent.home, heroSlides } })} createItem={() => ({ id: createId("hero"), mediaType: "image", mediaUrl: "/placeholder.svg", eyebrow: "", title: "", description: "", primaryCtaLabel: "", primaryCtaLink: "/inventory", secondaryCtaLabel: "", secondaryCtaLink: "/contact" })} formComponent={HeroSlideForm} />
                <CollectionList title="Stats" items={draftContent.home.stats} onChange={(stats) => setDraftContent({ ...draftContent, home: { ...draftContent.home, stats } })} createItem={() => ({ id: createId("stat"), value: "", label: "" })} formComponent={StatForm} />
                <CollectionList title="Why Us Items" items={draftContent.home.whyUsItems} onChange={(whyUsItems) => setDraftContent({ ...draftContent, home: { ...draftContent.home, whyUsItems } })} createItem={() => ({ id: createId("why"), title: "", description: "" })} formComponent={FeatureForm} />
                <CollectionList title="Testimonials" items={draftContent.home.testimonials} onChange={(testimonials) => setDraftContent({ ...draftContent, home: { ...draftContent.home, testimonials } })} createItem={() => ({ id: createId("testimonial"), name: "", role: "", text: "", rating: 5 })} formComponent={TestimonialForm} />
                <CollectionList title="FAQs" items={draftContent.home.faqs} onChange={(faqs) => setDraftContent({ ...draftContent, home: { ...draftContent.home, faqs } })} createItem={() => ({ id: createId("faq"), question: "", answer: "" })} formComponent={FaqForm} />
              </div>
            )}

            {/* About Page Sections */}
            {activeSection === "about" && (
              <div className="space-y-6">
                <CollectionList title="Values" items={draftContent.aboutPage.values} onChange={(values) => setDraftContent({ ...draftContent, aboutPage: { ...draftContent.aboutPage, values } })} createItem={() => ({ id: createId("value"), title: "", description: "" })} formComponent={FeatureForm} />
              </div>
            )}

            {/* Services Page Sections */}
            {activeSection === "services" && (
              <div className="space-y-6">
                <CollectionList title="Services" items={draftContent.servicesPage.services} onChange={(services) => setDraftContent({ ...draftContent, servicesPage: { ...draftContent.servicesPage, services } })} createItem={() => ({ id: createId("service"), title: "", description: "", details: [] })} formComponent={ServiceForm} />
              </div>
            )}

            {/* Inventory Section */}
            {activeSection === "inventory" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Vehicles ({vehiclesQuery.data?.length || 0})</h3>
                  <Button onClick={openVehicleAdd}><Plus className="mr-2 h-4 w-4" /> Add Vehicle</Button>
                </div>

                {(vehiclesQuery.data || []).length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No vehicles yet. Add your first vehicle!</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(vehiclesQuery.data || []).map((vehicle) => (
                      <div key={vehicle.id} className="rounded-lg border border-border bg-background p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{vehicle.name}</h4>
                            <p className="text-sm text-muted-foreground">{vehicle.category}</p>
                            <p className="text-sm font-medium">${vehicle.price.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openVehicleEdit(vehicle)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this vehicle?")) deleteVehicleMutation.mutate(vehicle.id); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Vehicle Sheet for Add/Edit */}
                <Sheet open={vehicleSheetOpen} onOpenChange={setVehicleSheetOpen}>
                  <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                      <SheetTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <VehicleForm vehicle={editingVehicle || blankVehicle} onSave={handleVehicleSave} onCancel={() => { setVehicleSheetOpen(false); setEditingVehicle(null); }} isNew={!editingVehicle} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}

            {/* Inquiries Section */}
            {activeSection === "inquiries" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Customer Inquiries ({inquiriesQuery.data?.length || 0})</h3>
                
                {(inquiriesQuery.data || []).length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No inquiries yet.</p>
                ) : (
                  <div className="space-y-4">
                    {(inquiriesQuery.data || []).map((inquiry) => (
                      <div key={inquiry.id} className="rounded-lg border border-border bg-background p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{inquiry.name}</h4>
                            <p className="text-sm text-muted-foreground">{inquiry.phone} {inquiry.email && `• ${inquiry.email}`}</p>
                            <p className="text-xs text-muted-foreground">{inquiry.subject} • {new Date(inquiry.createdAt).toLocaleString()}</p>
                            {inquiry.vehicleName && <p className="mt-2 text-sm font-medium">Vehicle: {inquiry.vehicleName}</p>}
                            <p className="mt-2 text-sm">{inquiry.message}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this inquiry?")) deleteInquiryMutation.mutate(inquiry.id); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-background p-6">
                  <h3 className="text-lg font-semibold mb-4">Site Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Site Name</label>
                      <Input value={draftContent.site.name} onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, name: e.target.value } })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Short Name</label>
                      <Input value={draftContent.site.shortName} onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, shortName: e.target.value } })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input value={draftContent.site.phone} onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, phone: e.target.value } })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input value={draftContent.site.email} onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, email: e.target.value } })} className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Address</label>
                      <Input value={draftContent.site.address} onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, address: e.target.value } })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">WhatsApp</label>
                      <Input value={draftContent.site.whatsapp} onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, whatsapp: e.target.value } })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location Link</label>
                      <Input value={draftContent.site.locationLink} onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, locationLink: e.target.value } })} className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Tagline</label>
                      <Input value={draftContent.site.tagline} onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, tagline: e.target.value } })} className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Footer Description</label>
                      <Textarea value={draftContent.site.footerDescription} onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, footerDescription: e.target.value } })} className="mt-1" />
                    </div>
                  </div>
                </div>

               <div className="rounded-lg border border-border bg-background p-6">
  <h3 className="text-lg font-semibold mb-4">Social Media</h3>
  <div className="grid gap-4 md:grid-cols-2">
    <div>
      <label className="text-sm font-medium">Facebook</label>
      <Input 
        value={draftContent.site.socialMedia.facebook} 
        onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, socialMedia: { ...draftContent.site.socialMedia, facebook: e.target.value } } })} 
        className="mt-1" 
      />
    </div>
    <div>
      <label className="text-sm font-medium">Instagram</label>
      <Input 
        value={draftContent.site.socialMedia.instagram} 
        onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, socialMedia: { ...draftContent.site.socialMedia, instagram: e.target.value } } })} 
        className="mt-1" 
      />
    </div>
    <div>
      <label className="text-sm font-medium">Telegram</label>
      <Input 
        value={draftContent.site.socialMedia.telegram} 
        onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, socialMedia: { ...draftContent.site.socialMedia, telegram: e.target.value } } })} 
        className="mt-1" 
      />
    </div>
    <div>
      <label className="text-sm font-medium">TikTok</label>
      <Input 
        value={draftContent.site.socialMedia.tiktok} 
        onChange={(e) => setDraftContent({ ...draftContent, site: { ...draftContent.site, socialMedia: { ...draftContent.site.socialMedia, tiktok: e.target.value } } })} 
        className="mt-1" 
      />
    </div>
  </div>
</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Admin;
