"use client";

import { useState } from "react";

export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    } catch {
      // Clipboard unavailable: the number stays visible and selectable next to the button.
    }
  }
  return (
    <button type="button" className="copy-btn" onClick={copy} aria-label={label}>
      {done ? "Copiado" : "Copiar"}
    </button>
  );
}
