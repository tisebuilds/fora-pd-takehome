import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono, Inter } from "next/font/google";
import { AppToaster } from "@/components/app-toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-serif-stack",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter-stack",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fora Porta: Clients",
  description: "Travel advisor client workspace (design scaffold)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${inter.variable} ${geistSans.variable} ${geistMono.variable} h-dvh overflow-hidden antialiased`}
    >
      <body className="flex h-dvh min-h-0 flex-col overflow-hidden">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
