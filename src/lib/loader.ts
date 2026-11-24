/**
 * Runs inline before first paint. Marks <html> so the loader CSS shows the curtain, only on the
 * first visit of the session and without reduced motion. Any failure (storage blocked) means no loader.
 */
export const LOADER_BOOT_SCRIPT = `try{if(!sessionStorage.getItem("rz-seen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-loader","on")}catch(e){}`;
