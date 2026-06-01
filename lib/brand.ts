// Identité de marque centralisée — un seul endroit à modifier pour renommer.
export const BRAND = {
  name: "Fidélise-moi",
  // Initiale affichée dans le logo / favicon.
  letter: "F",
  tagline: "Loyalty OS local",
  domain: "fidelise-moi.fr",
  email: "hello@fidelise-moi.fr",
  // Couleurs du logotype (cohérentes avec le thème).
  colors: {
    ink: "#0a0f1f",
    primary: "#2454ff",
    sun: "#f5b84b",
  },
} as const;

export const BRAND_NAME = BRAND.name;
