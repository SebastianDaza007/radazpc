"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Session loader (lime curtain); boot script in src/lib/loader.ts. The markup is always server-rendered but hidden by CSS; it only
 * shows when the inline script in app/layout.tsx sets `data-loader="on"` on <html> (first visit of
 * the session, no reduced motion, JS available). Two exits are guaranteed:
 *  - this component slides it out after fonts + 600 ms and marks the session as seen;
 *  - a CSS animation hides it after 3.5 s even if hydration never happens.
 */
export default function Loader() {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-loader") !== "on") return;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      root.removeAttribute("data-loader");
      try {
        sessionStorage.setItem("rz-seen", "1");
      } catch {
        // Storage blocked: the loader may show again next time, which is harmless.
      }
    };

    const fonts = document.fonts?.ready ?? Promise.resolve();
    const minimum = new Promise((resolve) => setTimeout(resolve, 600));
    const start = Promise.all([fonts, minimum]).then(() => setLeaving(true));
    const hardStop = setTimeout(finish, 3500);
    const afterExit = start.then(() => setTimeout(finish, 1000));

    return () => {
      clearTimeout(hardStop);
      void afterExit;
    };
  }, []);

  return (
    <div className={`loader${leaving ? " is-leaving" : ""}`} aria-hidden="true">
      <Image src="/brand/artefacto/img01.webp" alt="" width={180} height={56} priority className="loader-logo" />
    </div>
  );
}
