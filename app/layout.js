import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

/*
  Fonts are self hosted (latin variable woff2 in app/fonts) and loaded through
  next/font/local. This keeps optimization (preload, zero layout shift) while
  removing the build and runtime dependency on Google Fonts. Display serif is
  Playfair Display for headlines and the wordmark, Inter for body.
*/
const playfair = localFont({
  variable: "--font-playfair",
  display: "swap",
  src: [
    { path: "./fonts/playfair.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/playfair-italic.woff2", weight: "400 700", style: "italic" },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [{ path: "./fonts/inter.woff2", weight: "100 900", style: "normal" }],
});

const siteUrl = process.env.NEXT_PUBLIC_WEB_URL || "https://greentheworld.juice";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Green The World Juice",
    template: "%s | Green The World Juice",
  },
  description:
    "A juice subscription that pays you back daily. Eight cold pressed juices. Five tiers. One ritual.",
  openGraph: {
    title: "Green The World Juice",
    description: "Membership that pays you back in juice. Pressed daily, yours daily.",
    url: siteUrl,
    siteName: "Green The World Juice",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
