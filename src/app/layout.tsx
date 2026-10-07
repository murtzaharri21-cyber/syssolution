import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://syssolutionspk.com"),
  title: "SYS Solutions | Carefully checked laptops in Rawalpindi",
  description: "Find your next laptop with SYS Solutions. Carefully checked laptops, workstations, honest guidance and fast delivery from TechnoCity II, Rawalpindi.",
  applicationName: "SYS Solutions",
  openGraph: {
    title: "SYS Solutions | Good laptops. Honest advice.",
    description: "Carefully checked laptops for students, creators and teams. Visit SYS Solutions in Rawalpindi or shop on WhatsApp.",
    type: "website",
    locale: "en_PK",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
