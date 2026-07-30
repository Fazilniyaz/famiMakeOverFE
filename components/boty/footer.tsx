"use client"

import Link from "next/link"
import { Instagram, Phone, MapPin } from "lucide-react"

const INSTAGRAM_URL =
  "https://www.instagram.com/fami_makeover_and_henna_artist?igsh=MTNvNm5jYjUydzZ0"

const footerLinks = {
  shop: [
    { name: "All Products", href: "/shop" },
    { name: "Services", href: "/services" },
    { name: "Classes", href: "/classes" },
    { name: "Gallery", href: "/gallery" },
  ],
  about: [
    { name: "Our Story", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Beauty Classes", href: "/classes" },
  ],
  support: [
    { name: "Contact Us", href: "/about" },
    { name: "My Orders", href: "/profile/orders" },
    { name: "Wishlist", href: "/wishlist" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-card pt-20 pb-10 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <span className="font-serif text-[120px] sm:text-[160px] md:text-[280px] lg:text-[320px] font-bold text-white/20 whitespace-nowrap leading-none">
          Fami
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div className="col-span-2 md:col-span-1">
            <h2 className="font-serif text-3xl text-foreground mb-4">
              Fami<span className="italic text-primary">MakeOver</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Premium skincare, salon services, bridal makeup and beauty classes — glow with us in Coimbatore.
            </p>

            <div className="space-y-3 mb-6 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Karumbukkadai, Coimbatore - 641008</span>
              </p>
              <a
                href="tel:9363768792"
                className="flex items-center gap-2 hover:text-foreground fmo-transition"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>9363768792</span>
              </a>
            </div>

            <div className="flex gap-4">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground fmo-transition fmo-shadow"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-4">Explore</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground fmo-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-4">About</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground fmo-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground fmo-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FamiMakeOver. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground fmo-transition">
                Privacy Policy
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground fmo-transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
