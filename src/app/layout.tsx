import type { Metadata } from "next";
import { Inter, Stardos_Stencil, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const stardosStencil = Stardos_Stencil({
  variable: "--font-stardos-stencil",
  subsets: ["latin"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "String Authority App",
  description: "Verified Guitar Documentation & Provenance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${stardosStencil.variable} ${jetbrainsMono.variable} ${manrope.variable} antialiased`}
      >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-surface p-6 max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
      </body>
    </html>
  );
}
