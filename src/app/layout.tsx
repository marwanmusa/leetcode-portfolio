import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

// Load fonts with display:swap to avoid FOUT (Flash of Unstyled Text)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeetCode Portfolio",
  description: "A portfolio of LeetCode solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      {/* suppressHydrationWarning is used to prevent hydration errors with the __processed attribute */}
      <body suppressHydrationWarning={true}>
        <ThemeProvider>
          <div className="antialiased">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
