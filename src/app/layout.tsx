import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import LayoutWrapper from "@/components/LayoutWrapper";
import { DEFAULT_HERO_ALT, DEFAULT_SECTIONS } from "@/constants/site";

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
  title: "Jordan Hilado",
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
    <html lang="en">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-WGVKJ26WL1"
        ></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WGVKJ26WL1');
          `}
        </Script>
      </head>
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
    </html>
  );
}
