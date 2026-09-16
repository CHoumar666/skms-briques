import { siteConfig } from "@/lib/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // Outil de gestion interne contenant des données clients/fournisseurs :
    // on interdit volontairement l'indexation par les moteurs de recherche.
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
