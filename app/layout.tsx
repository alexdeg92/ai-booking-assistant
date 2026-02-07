import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookIA — Assistant de Réservation Intelligent | Perroquet",
  description:
    "Automatisez vos réservations avec l'intelligence artificielle. Idéal pour salons, spas et cliniques. Solution québécoise par Perroquet.",
  openGraph: {
    title: "BookIA — Assistant de Réservation Intelligent",
    description:
      "Automatisez vos réservations avec l'IA pour salons, spas et cliniques.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-white">{children}</body>
    </html>
  );
}
