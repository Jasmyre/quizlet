import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quizlet | Create and Share Flashcards with Ease",
    short_name: "Quizlet",
    description:
      "Create and share flashcards with ease using Quizlet, the ultimate study tool.",
    start_url: "/",
    display: "fullscreen",
    background_color: "#2d3639",
    theme_color: "#f0f0f0",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}