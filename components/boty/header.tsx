"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, ShoppingBag, Search, User, Heart, LogOut, Package, UserCircle, CalendarDays, GraduationCap, Sparkles } from "lucide-react"
import { CartDrawer } from "./cart-drawer"
import { Logo } from "@/components/brand/logo"
import { useCart } from "@/components/providers/cart-context"
import { useWishlist } from "@/components/providers/wishlist-context"
import { useAuth } from "@/components/providers/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { name: "Shop", href: "/shop" },
  { name: "Services", href: "/services" },
  { name: "Appointments", href: "/appointments" },
  { name: "Classes", href: "/classes" },
  { name: "Gallery", href: "/gallery" },
  { name: "About", href: "/about" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  const { setIsOpen, count } = useCart()
  const { items: wishlist } = useWishlist()
  const { isLoggedIn, user, openLogin, logout } = useAuth()

  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [searchOpen])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearchOpen(false)
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`)
    setQuery("")
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-2 pt-2 sm:px-4 sm:pt-4">
      <nav
        className="animate-scale-fade-in mx-auto max-w-7xl rounded-2xl border border-white/40 bg-white/50 px-2 py-0 backdrop-blur-md sm:px-5 lg:px-8"
        style={{ boxShadow: "rgba(0, 0, 0, 0.08) 0px 10px 40px" }}
      >
        <div className="flex h-14 items-center justify-between gap-2 sm:h-[68px] sm:gap-4">
          {/* Left — brand + nav */}
          <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-3 lg:gap-8">
            <button
              type="button"
              className="flex-shrink-0 p-1.5 text-foreground/80 hover:text-foreground fmo-transition sm:p-2 lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Logo className="min-w-0" />

            <div className="hidden items-center gap-6 xl:gap-7 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="whitespace-nowrap text-sm tracking-wide text-foreground/70 hover:text-foreground fmo-transition"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right — actions */}
          <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-1.5 text-foreground/70 hover:text-foreground fmo-transition sm:p-2"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/wishlist"
              className="relative hidden p-2 text-foreground/70 hover:text-foreground fmo-transition sm:block"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-2 text-foreground/70 hover:text-foreground fmo-transition"
                    aria-label="Account"
                  >
                    <UserCircle className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl">
                  <DropdownMenuLabel className="font-serif">
                    {user?.name || "My Account"}
                    {user?.phone && (
                      <span className="block text-xs font-normal text-muted-foreground">
                        +{user.phone}
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" /> My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/appointments" className="cursor-pointer">
                      <Sparkles className="mr-2 h-4 w-4" /> Your Enquired Services
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/enrollments" className="cursor-pointer">
                      <GraduationCap className="mr-2 h-4 w-4" /> Your Enrolled Courses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/appointments" className="cursor-pointer">
                      <CalendarDays className="mr-2 h-4 w-4" /> Book Appointment
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" /> Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                onClick={() => openLogin()}
                className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition sm:inline-flex"
              >
                <User className="h-4 w-4" /> Login
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-foreground/70 hover:text-foreground fmo-transition"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        <CartDrawer />

        {/* Mobile nav */}
        <div className={`overflow-hidden fmo-transition lg:hidden ${isMenuOpen ? "max-h-96 pb-6" : "max-h-0"}`}>
          <div className="flex flex-col gap-4 border-t border-border/50 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-sm tracking-wide text-foreground/70 hover:text-foreground fmo-transition"
              >
                {link.name}
              </Link>
            ))}
            {!isLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  openLogin()
                }}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                <User className="h-4 w-4" /> Login
              </button>
            ) : (
              <>
                <Link
                  href="/profile/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm tracking-wide text-foreground/70 hover:text-foreground"
                >
                  My Orders
                </Link>
                <Link
                  href="/profile/appointments"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm tracking-wide text-foreground/70 hover:text-foreground"
                >
                  Your Enquired Services
                </Link>
                <Link
                  href="/profile/enrollments"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm tracking-wide text-foreground/70 hover:text-foreground"
                >
                  Your Enrolled Courses
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm tracking-wide text-foreground/70 hover:text-foreground"
                >
                  Profile
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] animate-scale-fade-in bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-6 pt-28">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl text-foreground">Search products</h2>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-foreground/70 hover:text-foreground"
                aria-label="Close search"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={submitSearch} className="flex items-center gap-3 border-b-2 border-primary pb-4">
              <Search className="h-6 w-6 text-primary" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for serums, creams, oils…"
                className="flex-1 bg-transparent text-xl text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              <button
                type="submit"
                className="rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground hover:bg-primary/90 fmo-transition"
              >
                Search
              </button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">Press Enter to see all matching products.</p>
          </div>
        </div>
      )}
    </header>
  )
}
