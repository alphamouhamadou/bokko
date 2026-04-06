import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BOKKO - Covoiturage au Sénégal",
  description: "Application de covoiturage pour voyager au Sénégal. Thiès ↔ Dakar, Thiènaba ↔ Dakar.",
  keywords: ["covoiturage", "Sénégal", "Dakar", "Thiès", "transport", "BOKKO"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BOKKO",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    title: "BOKKO - Covoiturage au Sénégal",
    description: "Voyagez ensemble, économisez et contribuez à réduire la circulation à Dakar.",
    type: "website",
    locale: "fr_SN",
    siteName: "BOKKO",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#006233",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#006233" />
        <meta name="msapplication-TileColor" content="#006233" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-foreground`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}