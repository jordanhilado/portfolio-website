import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import LayoutWrapper from "@/components/LayoutWrapper";
import { DEFAULT_HERO_ALT, DEFAULT_SECTIONS } from "@/constants/site";

const sfPro = localFont({
  src: "../../public/fonts/SF-Pro.ttf",
  variable: "--font-sf-pro",
});

const sfMono = localFont({
  src: "../../public/fonts/SF-Mono-Regular.otf",
  variable: "--font-sf-mono",
  display: "swap",
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
        <link
          rel="preload"
          href="/fonts/SongMyung-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/SF-Pro.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/SF-Mono-Regular.otf"
          as="font"
          type="font/opentype"
          crossOrigin="anonymous"
        />
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
      <body className={`${sfPro.className} ${sfMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper
            sections={
              sections as ("About" | "Projects" | "Blogs" | "Hobbies")[]
            }
            heroAlt={heroAlt}
          >
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
