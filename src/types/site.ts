export type VehicleType = "motorcycle" | "bajaj";
export type Availability = "in-stock" | "on-order" | "sold-out";
export type HeroMediaType = "image" | "video";

export interface HeroSlide {
  id: string;
  mediaType: HeroMediaType;
  mediaUrl: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  secondaryCtaLink: string;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
}

export interface TextSection {
  label?: string;
  title: string;
  description?: string;
}

export interface CtaSection {
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  details: string[];
}

export interface StorySection {
  label?: string;
  title: string;
  description: string;
  paragraphs: string[];
  imageUrl: string;
  buttonLabel: string;
  buttonLink: string;
}

export interface SiteSettings {
  name: string;
  shortName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  businessHours: string[];
  footerDescription: string;
  vehicleCategories: string[];
}

export interface HomeContent {
  heroSlides: HeroSlide[];
  stats: StatItem[];
  featuredSection: TextSection;
  whyUsIntro: TextSection;
  whyUsItems: FeatureItem[];
  financeCta: CtaSection;
  testimonialsIntro: TextSection;
  testimonials: Testimonial[];
  faqIntro: TextSection;
  faqs: FaqItem[];
  finalCta: CtaSection;
}

export interface AboutPageContent {
  hero: TextSection;
  story: StorySection;
  mission: TextSection;
  valuesIntro: TextSection;
  values: FeatureItem[];
  cta: CtaSection;
}

export interface ServicesPageContent {
  hero: TextSection;
  services: ServiceItem[];
  cta: Omit<CtaSection, "secondaryCtaLabel" | "secondaryCtaLink">;
}

export interface ContactPageContent {
  hero: TextSection;
  detailsIntroTitle: string;
  detailsIntroDescription: string;
  formTitle: string;
  formDescription: string;
  mapLabel: string;
  subjectOptions: string[];
}

export interface SiteContent {
  site: SiteSettings;
  home: HomeContent;
  inventoryPage: TextSection;
  aboutPage: AboutPageContent;
  servicesPage: ServicesPageContent;
  contactPage: ContactPageContent;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  category: string;
  price: number;
  image: string;
  specs: {
    engine: string;
    power: string;
    fuelCapacity: string;
    weight: string;
    transmission: string;
  };
  availability: Availability;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  vehicleName?: string;
  createdAt: string;
}
