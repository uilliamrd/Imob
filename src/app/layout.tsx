import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/ThemeProvider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://realstateintelligence.com.br"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s — RealState Intelligence",
    default: "RealState Intelligence | Imóveis de Alto Padrão",
  },
  description: "Portal de imóveis de alto padrão. Encontre apartamentos, casas e lançamentos com curadoria especializada.",
  openGraph: {
    siteName: "RealState Intelligence",
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Prevent FOUC: apply saved theme class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t!=='light')document.documentElement.classList.add('dark');})()`
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
