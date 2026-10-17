export type Currency = "ARS" | "USD";

export type ServiceItem = {
  id: string;
  name: string;
  description: string;
  min?: number;
  max?: number;
  currency: Currency;
  /** Price is a starting point ("Desde"). */
  from: boolean;
  /** Final price is confirmed via WhatsApp. */
  ask: boolean;
};

export type GroupIcon = "pc" | "gpu";

export type ServiceGroup = {
  id: string;
  title: string;
  blurb: string;
  icon: GroupIcon;
  items: ServiceItem[];
};

export type PriceCatalog = {
  groups: ServiceGroup[];
};

export type GroupMeta = { blurb: string; icon: GroupIcon };
