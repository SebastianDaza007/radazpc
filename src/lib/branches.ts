export type Branch = {
  id: string;
  name: string;
  /** Short street label used in selectors. */
  street: string;
  address: string;
  phone: string;
  /** International format without "+", as wa.me expects. */
  whatsapp: string;
  rating: string;
  reviewCount: number;
  closes: string;
  maps: string;
  mapSeed: number;
  reviews: string[];
};

/** Google ratings and review counts are a snapshot taken on this date. */
export const RATINGS_DATE = "14/10/2026";

export const branches: Branch[] = [
  {
    id: "aguaray",
    name: "Sucursal Aguaray",
    street: "Aguaray 26",
    address: "Aguaray 26, Salta",
    phone: "0387 565-9971",
    whatsapp: "5493875659971",
    rating: "5,0",
    reviewCount: 100,
    closes: "Cierra a las 23:00",
    maps: "https://share.google/foh3FmaJg60LdA0tW",
    mapSeed: 3,
    reviews: [
      "Excelente servicio, rápido y efectivo.",
      "Muy buena atención, me solucionaron el problema en muy poco tiempo.",
      "Muy buena atención, rápidos y confiables en la entrega.",
    ],
  },
  {
    id: "norte",
    name: "Sucursal Zona Norte",
    street: "Barrio Universidad Católica",
    address:
      "Barrio Universidad Católica, Mz. 507 Casa 18, San Mateo Apóstol esquina San Pedro Apóstol, Salta",
    phone: "0387 527-8489",
    whatsapp: "5493875278489",
    rating: "5,0",
    reviewCount: 58,
    closes: "Cierra a las 23:00",
    maps: "https://share.google/1ElvXF3u6CROHY2Il",
    mapSeed: 7,
    reviews: [
      "Excelente atención, me hicieron cambio de pasta en CPU y GPU.",
      "Buena atención, precios accesibles y trabajo de muy buena calidad.",
      "Excelente servicio, información clara, recomendable 100%.",
    ],
  },
];

export const totalReviews = branches.reduce((sum, b) => sum + b.reviewCount, 0);

export function whatsappUrl(branch: Branch, text?: string): string {
  const base = `https://wa.me/${branch.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
