import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trajectory - Pilotez votre croissance financière",
  description: "Planifiez, facturez, analysez — tout depuis un seul cockpit. Plateforme tout-en-un pour les PME et freelances français.",
  keywords: ["comptabilité", "facturation", "CRM", "planification financière", "PME", "freelance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
