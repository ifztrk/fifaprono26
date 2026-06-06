import type { NextConfig } from "next";

// En-têtes de sécurité appliqués à toutes les pages
const securityHeaders = [
  // Empêche l'app d'être affichée dans une iframe (anti-clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Empêche le navigateur de "deviner" le type des fichiers
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limite les infos de provenance envoyées vers l'extérieur
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Désactive des API sensibles par défaut
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // Force le HTTPS pendant 2 ans (HSTS)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Politique de contenu : autorise seulement nos ressources + drapeaux flagcdn
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' https://flagcdn.com data:",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
