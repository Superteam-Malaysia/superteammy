import type { Metadata } from "next";
import { Archivo, Orbitron } from "next/font/google";
import "./globals.css";

// Canonical origin. next-sitemap reads the same variable, so the sitemap,
// robots.txt and metadata never disagree about which host is real.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://my.superteam.fun";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  // Without this, relative OG/Twitter image paths resolve against the build
  // host rather than the site.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: "Superteam Malaysia | The Home for Solana Builders in Malaysia",
  description:
    "Superteam Malaysia connects builders, creators, and founders in the Solana ecosystem. Access grants, bounties, hackathons, and a global network of Web3 talent.",
  keywords: [
    "Superteam",
    "Malaysia",
    "Solana",
    "Web3",
    "Blockchain",
    "Crypto",
    "Builders",
    "Community",
  ],
  openGraph: {
    title: "Superteam Malaysia | The Home for Solana Builders",
    description:
      "Join the fastest-growing Solana community in Malaysia. Access grants, bounties, hackathons, and connect with top Web3 talent.",
    url: SITE_URL,
    siteName: "Superteam Malaysia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@SuperteamMY",
    title: "Superteam Malaysia",
    description:
      "The Home for Solana Builders in Malaysia",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png" },
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
    <html lang="en" className={`${archivo.variable} ${orbitron.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
