import type { Metadata } from "next";
import { Archivo, Geist } from "next/font/google";
import "./globals.css";
import Loader from "@/components/Loader";
import { LOADER_BOOT_SCRIPT } from "@/lib/loader";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  weight: "variable",
  display: "swap",
});

export const metadata: Metadata = {
  title: site.name,
  description: site.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: LOADER_BOOT_SCRIPT }} />
        <Loader />
        {children}
      </body>
    </html>
  );
}
