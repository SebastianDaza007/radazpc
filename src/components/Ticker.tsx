"use client";

import { useState } from "react";
import { site } from "@/lib/site";

export default function Ticker() {
  const [paused, setPaused] = useState(false);
  return (
    <div className="ticker-wrap">
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track" style={{ animationPlayState: paused ? "paused" : "running" }}>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i}>{site.tagline}</span>
          ))}
        </div>
      </div>
      <button type="button" className="ticker-toggle" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
        {paused ? "Reanudar" : "Pausar"}
      </button>
    </div>
  );
}
