import type { MetadataRoute } from "next";

/** Permite instalar o painel na tela inicial do celular e abri-lo sem a barra do navegador. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tasty — Painel do restaurante",
    short_name: "Tasty",
    description: "Pedidos, entregadores, estoque, preços e marketing do seu restaurante.",
    lang: "pt-BR",
    start_url: "/inicio",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#ffa60c",
    background_color: "#ffa60c",
    icons: [
      { src: "/icons/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icone-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
