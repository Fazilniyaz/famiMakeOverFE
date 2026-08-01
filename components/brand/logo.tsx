import Link from "next/link"
import { cn } from "@/lib/utils"

/** Custom botanical monogram — a blooming petal mark that reads as an "F". */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      {/* outer ring */}
      <circle cx="24" cy="24" r="22.5" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      {/* blooming petals */}
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M24 34c0-6 0-10 0-16 0-3.2 2.4-5.6 5.6-5.6 2.6 0 4.4 1.8 4.4 4.2 0 2.8-2.3 4.6-6 4.6h-4"
          fill="none"
        />
        <path d="M24 22h5.5" />
        {/* left leaf */}
        <path
          d="M24 34c-4.8 0-8.6-2.2-10.4-6 3.8-1 7.2.2 10.4 3.4"
          fill="currentColor"
          fillOpacity="0.12"
        />
        {/* petal accent */}
        <path
          d="M24 12.4c-2.4-2-5.4-2.6-8.4-1.6 1 3 3.2 5 6.4 5.8"
          fill="currentColor"
          fillOpacity="0.12"
        />
      </g>
      <circle cx="30" cy="17.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function Logo({
  className,
  href = "/",
  showMark = true,
}: {
  className?: string
  href?: string
  showMark?: boolean
}) {
  return (
    <Link href={href} className={cn("group inline-flex min-w-0 items-center gap-1.5 sm:gap-2.5", className)}>
      {showMark && (
        <BrandMark className="h-7 w-7 flex-shrink-0 text-primary fmo-transition group-hover:rotate-6 sm:h-8 sm:w-8" />
      )}
      <span className="truncate font-serif text-lg leading-none tracking-wide text-foreground sm:text-2xl">
        Fami<span className="italic text-primary">MakeOver</span>
      </span>
    </Link>
  )
}
