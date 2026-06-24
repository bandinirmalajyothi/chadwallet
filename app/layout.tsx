import type { Metadata } from "next";
import "./globals.css";
import { PrivyProviderWrapper } from "@/components/providers/PrivyProvider";

export const metadata: Metadata = {
  title: "ChadWallet — Trade Like a Chad",
  description: "The fastest Solana trading app. Buy, sell, and track memecoins and viral tokens in seconds.",
  themeColor: "#07060f",
  openGraph: {
    title: "ChadWallet — Trade Like a Chad",
    description: "The fastest Solana trading app. Buy, sell, and track memecoins and viral tokens in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <PrivyProviderWrapper>
          {children}
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}
