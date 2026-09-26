import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/config/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { R001Splash } from "@/components/R001Splash";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: {
    default: `${site.name} — ${site.mood}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "en_US",
    type: "website",
  },
  verification: {
    google: "gyXQTr7AzMIDkSVuWKw23dD_1QyqJ_fduppUTNMDo14",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${plex.variable}`}
    >
      <body>
        <a className="skip" href="#content">
          Skip to content
        </a>
        <R001Splash />
        <div className="site">
          <Header />
          <main id="content" className="main">
            {children}
          </main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
