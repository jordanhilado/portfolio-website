import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import LayoutWrapper from "@/components/LayoutWrapper";
import Analytics from "@/components/Analytics";
import {
  DEFAULT_HERO_ALT,
  DEFAULT_SECTIONS,
  SITE_TITLE,
  SITE_URL,
} from "@/constants/site";

const sfPro = localFont({
  src: "../../public/fonts/SF-Pro.woff2",
  variable: "--font-sf-pro",
  display: "swap",
  weight: "400 700",
});

const sfMono = localFont({
  src: "../../public/fonts/SF-Mono-Regular.woff2",
  variable: "--font-sf-mono",
  display: "swap",
});

const songMyung = localFont({
  src: "../../public/fonts/SongMyung-Regular.woff2",
  variable: "--font-song-myung",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: "Jordan Hilado's personal website",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sections = [...DEFAULT_SECTIONS];
  const heroAlt = DEFAULT_HERO_ALT;

  return (
    // next-themes sets class and color-scheme on <html> before hydration, so
    // the server markup can never match; this silences only <html>'s own attributes.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sfPro.variable} ${sfMono.variable} ${songMyung.variable} font-sfpro`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper sections={sections} heroAlt={heroAlt}>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
      <Analytics />
    </html>
  );
}
