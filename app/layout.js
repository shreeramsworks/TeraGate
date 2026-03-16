import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "../components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TeraGet - Inspect Terabox Videos",
  description:
    "Inspect, preview, and download Terabox videos. Extract metadata, view thumbnails, and get direct download links from share links.",
  keywords: [
    "terabox",
    "terashare",
    "video inspector",
    "metadata extractor",
    "download",
    "preview",
    "video analysis",
  ],
  authors: [],
  robots: "index, follow",
  openGraph: {
    title: "TeraGet - Inspect Terabox Videos",
    description:
      "Inspect, preview, and download Terabox videos with metadata extraction and direct download links.",
    type: "website",
    locale: "en_US",
    siteName: "TeraGet",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TeraGet - Inspect Terabox Videos",
    description:
      "Inspect, preview, and download Terabox videos with metadata extraction.",
    images: ["/api/og"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
