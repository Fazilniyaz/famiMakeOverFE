import React from "react"
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600']
});

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  metadataBase: new URL('https://famimakeover.com'),
  title: {
    default: 'FamiMakeOver — Beauty Parlor, Skincare & Bridal Studio',
    template: '%s | FamiMakeOver',
  },
  description:
    'FamiMakeOver — premium skincare products, salon services, bridal makeup, mehandi and professional beauty classes. Book, shop and glow with us.',
  generator: 'Next.js',
  applicationName: 'FamiMakeOver',
  keywords: [
    'beauty parlor', 'bridal makeup', 'mehandi', 'skincare', 'salon services',
    'beauty classes', 'facial', 'hair spa', 'natural skincare', 'FamiMakeOver',
  ],
  openGraph: {
    title: 'FamiMakeOver — Beauty Parlor, Skincare & Bridal Studio',
    description:
      'Premium skincare products, salon services, bridal makeup and professional beauty classes.',
    type: 'website',
    siteName: 'FamiMakeOver',
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F7F4EF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
