import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { Providers } from "@/components/providers"
import Navbar from "@/components/layout/navbar"

const chiosevka = localFont({
  src: [
    {
      path: "../public/fonts/ChiosevkaTermext-Extended.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/ChiosevkaTermext-ExtendedBold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-chiosevka",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Dotdeck - Config Snippets & Dotfile Explorer",
  description: "Discover and share your favorite development configurations.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${chiosevka.variable} font-mono`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
            <footer className="py-4 text-center text-sm text-muted-foreground border-t">
              © {new Date().getFullYear()} Dotdeck. All rights reserved.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
