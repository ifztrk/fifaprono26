import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FIFAPRONO 26",
    short_name: "FIFAPRONO",
    description:
      "Pronostics entre amis pour la Coupe du Monde 2026 : scores, qualifiés de groupe et vainqueur final.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#15994f",
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
