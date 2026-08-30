import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#05080c",
  // The map is full-bleed and the UI already handles safe areas itself.
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "GeoMaster",
  // Installable as a home-screen app. Deliberately no service worker: the map
  // needs the network, so an offline shell would promise more than it delivers.
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "GeoMaster",
    statusBarStyle: "black-translucent",
  },
  description:
    "A premium, map-centric geography learning app for mastering world countries.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      {
        url: "/brand/geomaster-icon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/brand/geomaster-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full overflow-hidden antialiased" suppressHydrationWarning>
        <Script
          id="remove-extension-hydration-attributes"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function removeExtensionHydrationAttributes() {
                function clean() {
                  document.body?.removeAttribute("data-new-gr-c-s-check-loaded");
                  document.body?.removeAttribute("data-gr-ext-installed");
                }
                clean();
                if (!document.body) {
                  document.addEventListener("DOMContentLoaded", clean, { once: true });
                }
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
