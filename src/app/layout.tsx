import type { Metadata, Viewport } from "next";
import { Geist, Outfit } from "next/font/google";
import "./globals.css";
import PitchLines from "@/components/PitchLines";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FIFAPRONO 26 ⚽",
  description:
    "Pronostics entre amis pour la Coupe du Monde 2026 — scores, qualifiés de groupe et vainqueur final.",
  applicationName: "FIFAPRONO 26",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FIFAPRONO 26",
  },
};

export const viewport: Viewport = {
  themeColor: "#15994f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Applique le thème mémorisé avant le rendu (évite le flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full">
        <PitchLines />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
