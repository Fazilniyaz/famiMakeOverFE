"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#e3e1e2]">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute left-1/2 top-1/2 h-full min-h-full w-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
        >
          <source
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f3d8cad2-8091-4809-aac0-eaac74b0be7c-Z4XUCz3CRR7qjaOsoq6rFmbJfIRdgs.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-background via-background/55 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
            <span
              className="mb-4 block text-[11px] uppercase tracking-[0.22em] text-black/80 opacity-0 animate-blur-in sm:mb-6 sm:text-sm sm:tracking-[0.28em]"
              style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
            >
              Natural Skincare
            </span>

            <h1 className="mb-5 font-serif leading-[1.12] text-black sm:mb-6">
              <span
                className="block text-[clamp(1.75rem,8vw,3.75rem)] font-semibold opacity-0 animate-blur-in md:text-6xl lg:text-7xl"
                style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
              >
                Glow gently.
              </span>
              <span
                className="mt-1 block text-[clamp(1.85rem,9vw,4.5rem)] font-semibold opacity-0 animate-blur-in xl:text-8xl"
                style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
              >
                Naturally you.
              </span>
            </h1>

            <p
              className="mx-auto mb-8 max-w-[20rem] text-sm leading-relaxed text-black/90 opacity-0 animate-blur-in sm:mb-10 sm:max-w-md sm:text-base md:text-lg lg:mx-0"
              style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
            >
              Discover skincare that breathes with you. Pure ingredients, gentle rituals, radiant
              results.
            </p>

            <div
              className="flex justify-center opacity-0 animate-blur-in lg:justify-start"
              style={{ animationDelay: "1s", animationFillMode: "forwards" }}
            >
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm tracking-wide text-primary-foreground fmo-shadow fmo-transition hover:bg-primary/90 sm:gap-3 sm:px-8 sm:py-4"
              >
                Shop Now
                <ArrowRight className="h-4 w-4 fmo-transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-black sm:bottom-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] sm:text-xs sm:tracking-widest">
          Scroll
        </span>
        <div className="relative h-10 w-px overflow-hidden bg-foreground/20 sm:h-12">
          <div className="absolute left-0 top-0 h-1/2 w-full animate-pulse bg-foreground/60" />
        </div>
      </div>
    </section>
  )
}
