import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "../components/ErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TeraGet | 100% Free Terabox Video Downloader - No Login Required",
  description:
    "Fastest and most secure way to download Terabox videos. No login, no ads, high-speed direct downloads. Simply paste your Terashare or Terabox link and get your video instantly.",
  keywords: [
    "terabox downloader",
    "terashare downloader",
    "terabox video download",
    "direct download terabox",
    "terabox without login",
    "online video downloader",
    "terabox link to mp4",
    "1024terabox downloader"
  ],
  authors: [{ name: "TeraGet Team" }],
  creator: "TeraGet",
  publisher: "TeraGet",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  alternates: {
    canonical: "https://teraget.vercel.app",
  },
  openGraph: {
    title: "TeraGet - Unlimited Terabox & Terashare Video Downloader",
    description: "The premium, minimalist tool to extract and download Terabox videos directly to your device with one click.",
    type: "website",
    locale: "en_US",
    siteName: "TeraGet",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "TeraGet - Premium Terabox Downloader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TeraGet | Download Terabox Videos Instantly",
    description: "Secure, fast, and free Terabox video downloader. No account needed.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/manifest.json",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased bg-[#0a0a0a]`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
