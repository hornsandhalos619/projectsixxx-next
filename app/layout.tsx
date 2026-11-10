import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/config/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { shareMetadata } from "@/lib/seo";
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


const defaultTitle = `${site.name} — ${site.mood}`;
const homeShare = shareMetadata("/", {
  title: defaultTitle,
  description: site.description,
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: {
    default: defaultTitle,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  alternates: homeShare.alternates,
  openGraph: {
    ...homeShare.openGraph,
    siteName: site.name,
    locale: "en_US",
  },
  twitter: homeShare.twitter,
  verification: {
    google: "gyXQTr7AzMIDkSVuWKw23dD_1QyqJ_fduppUTNMDo14",
    other: { "p:domain_verify": "1d7384e3ca0a063c89de014eb97831e4" },
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
