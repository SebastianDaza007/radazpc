import { branches, RATINGS_DATE, totalReviews, whatsappUrl, type Branch } from "@/lib/branches";
import CopyButton from "./CopyButton";

function Stars({ className = "" }: { className?: string }) {
  return (
    <span className={`stars ${className}`} role="img" aria-label="5 de 5 estrellas">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.8 21.4l1.5-7.1L1.9 9.4l7.2-.8z" />
        </svg>
      ))}
    </span>
  );
}

/** Decorative street-map pattern, deterministic per branch. */
function MapArt({ seed }: { seed: number }) {
  const r = (k: number) => {
    const x = Math.sin(seed * 97 + k * 13.7) * 10000;
    return x - Math.floor(x);
  };
  const n = (v: number) => Math.round(v * 10) / 10;
  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mapa ilustrativo, abrí Google Maps para ver la ubicación exacta">
      <rect width="320" height="160" fill="#0C1510" />
      {Array.from({ length: 7 }, (_, i) => {
        const x = 20 + i * 46 + r(i) * 14;
        return <path key={`v${i}`} d={`M${n(x)} 0 L${n(x + (r(i + 9) - 0.5) * 40)} 160`} stroke="#1E3326" strokeWidth={i % 3 === 0 ? 7 : 3} fill="none" />;
      })}
      {Array.from({ length: 4 }, (_, j) => {
        const y = 18 + j * 40 + r(j + 20) * 14;
        return <path key={`h${j}`} d={`M0 ${n(y)} L320 ${n(y + (r(j + 30) - 0.5) * 40)}`} stroke="#1E3326" strokeWidth={j % 2 ? 3 : 7} fill="none" />;
      })}
      {Array.from({ length: 9 }, (_, b) => (
        <rect key={`b${b}`} x={n(10 + r(b + 40) * 280)} y={n(8 + r(b + 50) * 130)} width={n(16 + r(b + 60) * 22)} height={n(10 + r(b + 70) * 16)} fill="#13221A" rx="2" />
      ))}
      <g transform="translate(160 72)">
        <circle r="26" fill="#A4BE00" opacity=".18" />
        <path d="M0 22C-10 10-14 2-14-6a14 14 0 0 1 28 0C14 2 10 10 0 22z" fill="#A4BE00" />
        <circle cy="-6" r="5" fill="#070A08" />
      </g>
    </svg>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  return (
    <article className="branch">
      <div className="map">
        <MapArt seed={branch.mapSeed} />
        <a className="map-link" href={branch.maps} target="_blank" rel="noopener noreferrer">
          Abrir en Google Maps
        </a>
      </div>
      <div className="branch-body">
        <h3 className="display text-xl">{branch.name}</h3>
        <div className="meta">
          <div>
            <span>{branch.address}</span>
          </div>
          <div>
            <span className="tabular-nums">{branch.phone}</span>
            <CopyButton text={branch.phone} label={`Copiar teléfono de ${branch.name}`} />
          </div>
          <div>
            <span>{branch.closes} (horario de hoy según Google)</span>
          </div>
        </div>
        <div>
          <Stars /> <strong>{branch.rating}</strong>{" "}
          <span className="text-mist/60">
            · {branch.reviewCount} opiniones en Google (al {RATINGS_DATE})
          </span>
        </div>
        <ul className="reviews">
          {branch.reviews.map((q) => (
            <li key={q}>
              “{q}”<cite>Opinión de un cliente en Google</cite>
            </li>
          ))}
        </ul>
        <a className="btn-ghost" href={whatsappUrl(branch)} target="_blank" rel="noopener noreferrer">
          Escribir a esta sucursal
        </a>
      </div>
    </article>
  );
}

export default function Branches() {
  return (
    <section id="sucursales" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
      <div className="mb-12 max-w-3xl">
        <p className="eyebrow">Sucursales y opiniones</p>
        <h2 className="display mt-4 text-3xl sm:text-5xl">Dos puntos en Salta. Clientes que ya nos eligieron.</h2>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="display text-5xl text-lime sm:text-6xl">5,0</span>
          <span>
            <Stars />
            <br />
            <span className="text-sm text-mist/60">
              {totalReviews} opiniones en Google entre las dos sucursales (al {RATINGS_DATE})
            </span>
          </span>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {branches.map((b) => (
          <BranchCard key={b.id} branch={b} />
        ))}
      </div>
    </section>
  );
}
