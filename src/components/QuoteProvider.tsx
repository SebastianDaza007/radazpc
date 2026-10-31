"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { branches, type Branch } from "@/lib/branches";
import { computeQuote, findItem, type Quote } from "@/lib/quote";
import type { PriceCatalog } from "@/lib/services.types";

type QuoteState = {
  catalog: PriceCatalog;
  selected: string[];
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  branchIndex: number;
  setBranchIndex: (i: number) => void;
  branch: Branch;
  quote: Quote;
};

const QuoteContext = createContext<QuoteState | null>(null);

export function QuoteProvider({ catalog, children }: { catalog: PriceCatalog; children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [branchIndex, setBranchIndex] = useState(0);

  const toggle = useCallback(
    (id: string) => {
      if (!findItem(catalog, id)) return;
      setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    [catalog],
  );

  const value = useMemo<QuoteState>(
    () => ({
      catalog,
      selected,
      isSelected: (id) => selected.includes(id),
      toggle,
      branchIndex,
      setBranchIndex,
      branch: branches[branchIndex],
      quote: computeQuote(catalog, selected),
    }),
    [catalog, selected, toggle, branchIndex],
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote(): QuoteState {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used inside <QuoteProvider>");
  return ctx;
}
