import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { MapPin, Phone, Instagram } from "lucide-react"
import Link from "next/link"

const INSTAGRAM_URL =
  "https://www.instagram.com/fami_makeover_and_henna_artist?igsh=MTNvNm5jYjUydzZ0"

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pb-20 pt-28">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span className="mb-4 block text-sm uppercase tracking-[0.3em] text-primary">Our Story</span>
            <h1 className="mb-6 font-serif text-4xl text-foreground md:text-6xl">
              Fami<span className="italic text-primary">MakeOver</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              A beauty parlor rooted in Coimbatore — where bridal artistry, henna, skincare and professional
              beauty education come together under one warm roof.
            </p>
          </div>

          <div className="space-y-10 text-foreground/90 leading-relaxed">
            <section className="rounded-3xl bg-card p-8 fmo-shadow">
              <h2 className="mb-4 font-serif text-2xl text-foreground">Who we are</h2>
              <p className="text-muted-foreground">
                FamiMakeOver is a boutique beauty studio specializing in bridal makeup, mehandi / henna art,
                salon services and hands-on beauty classes. We believe every client deserves a calm, caring
                experience — whether you&apos;re getting ready for your big day or learning the craft yourself.
              </p>
            </section>

            <section className="rounded-3xl bg-card p-8 fmo-shadow">
              <h2 className="mb-4 font-serif text-2xl text-foreground">What we offer</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>• Bridal & party makeup styled for every skin tone</li>
                <li>• Traditional and modern mehandi / henna designs</li>
                <li>• Facials, hair care and skincare services</li>
                <li>• Curated natural skincare products</li>
                <li>• Professional beauty classes for aspiring artists</li>
              </ul>
            </section>

            <section className="rounded-3xl bg-card p-8 fmo-shadow">
              <h2 className="mb-4 font-serif text-2xl text-foreground">Visit us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>Karumbukkadai, Coimbatore - 641008</span>
                </p>
                <a href="tel:9363768792" className="flex items-center gap-3 hover:text-foreground fmo-transition">
                  <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
                  <span>9363768792</span>
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-foreground fmo-transition"
                >
                  <Instagram className="h-5 w-5 flex-shrink-0 text-primary" />
                  <span>@fami_makeover_and_henna_artist</span>
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/services"
                  className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition"
                >
                  Book a Service
                </Link>
                <Link
                  href="/classes"
                  className="rounded-full border border-border px-6 py-3 text-sm text-foreground hover:bg-muted fmo-transition"
                >
                  Explore Classes
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
