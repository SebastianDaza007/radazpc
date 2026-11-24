"use client";

import Image from "next/image";
import { useState } from "react";

export type BeforeAfterItem = {
  title: string;
  subtitle: string;
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
};

function Slider({ item }: { item: BeforeAfterItem }) {
  const [pos, setPos] = useState(50);
  return (
    <figure className="ba" style={{ ["--pos" as string]: `${pos}%` }}>
      <div className="ba-fig">
        <Image src={item.beforeSrc} alt={item.beforeAlt} fill sizes="(max-width: 900px) 100vw, 380px" className="object-cover" />
        <div className="ba-after-layer">
          <Image src={item.afterSrc} alt={item.afterAlt} fill sizes="(max-width: 900px) 100vw, 380px" className="object-cover" />
        </div>
        <span className="ba-label ba-label-l">Antes</span>
        <span className="ba-label ba-label-r">Después</span>
        <div className="ba-handle" aria-hidden="true" />
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Comparar antes y después: ${item.title}`}
        />
      </div>
      <figcaption>
        {item.title}
        <span>{item.subtitle}</span>
      </figcaption>
    </figure>
  );
}

/** Not mounted yet: waiting for real before/after photos. Pass them in `items` and render in app/page.tsx. */
export default function BeforeAfter({ items }: { items: BeforeAfterItem[] }) {
  if (!items.length) return null;
  return (
    <section id="trabajos" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
      <div className="mb-12 max-w-3xl">
        <p className="eyebrow">Trabajos</p>
        <h2 className="display mt-4 text-3xl sm:text-5xl">Antes y después de cada equipo.</h2>
        <p className="mt-4 text-mist/70">Arrastrá el control para ver cómo llega el equipo y cómo se lo lleva el cliente.</p>
      </div>
      <div className="ba-grid">
        {items.map((item) => (
          <Slider key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}
