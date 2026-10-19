export type Category = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  kind: "food" | "drink";
  emoji: string;
  sortOrder: number;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isVegan: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  sortOrder: number;
  allergens: string[];
};

export type Allergen = {
  code: string;
  name: string;
  shortName: string;
  emoji: string;
  description: string;
};

export type Promo = {
  id: string;
  title: string;
  description: string;
  badge: string;
  dayOfWeek: number | null;
  imageUrl: string;
};

export type EventItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  eventDate: string | null;
  eventTime: string;
  badge: string;
  ctaLabel: string;
};

export type GalleryImage = {
  id: string;
  url: string;
  caption: string;
};

export type OpeningHour = {
  dayOfWeek: number;
  label: string;
  lunchOpen: string | null;
  lunchClose: string | null;
  dinnerOpen: string | null;
  dinnerClose: string | null;
  isClosed: boolean;
};

export type VenueSettings = {
  name: string;
  tagline: string;
  claim: string;
  address: string;
  phone: string;
  phoneAlt: string;
  email: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  maps: string;
  coperto: string;
  paymentNote: string;
  deliveryFee?: string;
  deliveryMinimum?: string;
  deliveryNote?: string;
  parking?: string;
  services?: string;
};

export type HeroSettings = {
  kicker: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  image: string;
  marquee: string[];
};

export type ReservationSettings = {
  notice: string;
  slotMinutes: number;
  lastSeating: string;
  maxParty: number;
  capacity?: number;
};

export type LoyaltySettings = {
  pointsPerEuro: number;
  welcomePoints: number;
  rewardThreshold: number;
  rewardValue: number;
  terms: string;
};

export type OrderSettings = {
  prepTime: number;
  deliveryFee: number;
  deliveryMinimum: number;
  pickupNote: string;
  deliveryNote: string;
};

export type SeoSettings = {
  title: string;
  description: string;
};

export type SiteContent = {
  categories: Category[];
  items: MenuItem[];
  allergens: Allergen[];
  promos: Promo[];
  events: EventItem[];
  gallery: GalleryImage[];
  hours: OpeningHour[];
  settings: {
    venue?: VenueSettings;
    hero?: HeroSettings;
    reservation?: ReservationSettings;
    loyalty?: LoyaltySettings;
    order?: OrderSettings;
    seo?: SeoSettings;
    [key: string]: unknown;
  };
  closedDates: { date: string; reason: string }[];
};

export type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  date: string;
  time: string;
  area: string;
  occasion: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  adminNotes: string;
  source: string;
  createdAt: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivering"
  | "completed"
  | "cancelled";

export type OrderItem = {
  id?: string;
  menuItemId?: string | null;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  fulfilment: "pickup" | "delivery";
  address: string;
  pickupTime: string;
  notes: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  adminNotes: string;
  source: string;
  items: OrderItem[];
  createdAt: string;
};

export type LoyaltyMember = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  birthday: string | null;
  points: number;
  isActive: boolean;
  createdAt: string;
};

export type LoyaltyTransaction = {
  id: string;
  points: number;
  reason: string;
  createdAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
};

export type AdminPromo = Promo & { isActive: boolean; sortOrder: number };
export type AdminEvent = EventItem & { isPublished: boolean; sortOrder: number };
export type AdminGallery = GalleryImage & { isPublished: boolean; sortOrder: number };
export type AdminCategory = Category & { isActive: boolean };

export type AvailabilitySlot = {
  time: string;
  seatsLeft: number;
  available: boolean;
};
