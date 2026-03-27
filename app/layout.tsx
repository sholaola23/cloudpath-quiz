import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CloudPath Quiz — Which Cloud Career Fits You?",
  description:
    "8 questions. 3 minutes. A personalised cloud career recommendation powered by AI — from a Solutions Architect at AWS.",
  metadataBase: new URL("https://cloudpath.sholastechnotes.com"),
  openGraph: {
    title: "CloudPath Quiz — Which Cloud Career Fits You?",
    description:
      "8 questions. 3 minutes. Discover your ideal cloud career path with a personalised AI recommendation.",
    type: "website",
    locale: "en_GB",
    siteName: "CloudPath Quiz by Shola's Tech Notes",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "CloudPath Quiz — Which Cloud Career Fits You?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudPath Quiz — Which Cloud Career Fits You?",
    description:
      "8 questions. 3 minutes. Discover your ideal cloud career path.",
    images: ["/images/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
