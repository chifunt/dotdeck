"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  PlusCircle,
  UserCircle,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
  Settings,
  User,
  Search,
  X,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const [showMiniSearch, setShowMiniSearch] = useState(false)
  const [miniSearchTerm, setMiniSearchTerm] = useState("")
  const [isMiniSearchFocused, setIsMiniSearchFocused] = useState(false)
  const { user, logout, isLoading } = useAuth()

  useEffect(() => {
    if (!isHomePage) {
      setShowMiniSearch(false)
      return
    }

    const handleScroll = () => {
      // Show mini search when scrolled past the main search section (approximately 300px)
      setShowMiniSearch(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHomePage])

  const handleMiniSearch = () => {
    if (miniSearchTerm.trim()) {
      // Navigate to homepage with search query
      const searchParams = new URLSearchParams()
      searchParams.set("q", miniSearchTerm.trim())
      window.location.href = `/?${searchParams.toString()}`
    }
  }

  const handleMiniSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleMiniSearch()
    }
  }

  const clearMiniSearch = () => {
    setMiniSearchTerm("")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-down">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 hover-scale transition-all duration-200 group">
          <Settings className="h-6 w-6 text-rose group-hover:animate-spin transition-all duration-300" />
          <span className="font-bold text-xl bg-gradient-to-r from-rose via-foam to-gold bg-clip-text text-transparent">
            Dotdeck
          </span>
        </Link>

        {/* Mini search bar in center - only show on homepage when scrolled */}
        {isHomePage && showMiniSearch && (
          <div
            className={cn(
              "hidden md:flex items-center space-x-2 flex-1 max-w-md mx-8 transition-all duration-300",
              showMiniSearch ? "animate-slide-down opacity-100" : "opacity-0",
            )}
          >
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Quick search..."
                value={miniSearchTerm}
                onChange={(e) => setMiniSearchTerm(e.target.value)}
                onKeyPress={handleMiniSearchKeyPress}
                onFocus={() => setIsMiniSearchFocused(true)}
                onBlur={() => setIsMiniSearchFocused(false)}
                className={cn(
                  "h-9 text-sm transition-all duration-200 pr-16 border-foam/30 focus:border-foam focus:ring-foam/50",
                  isMiniSearchFocused && "ring-2 ring-foam/50",
                )}
              />
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {miniSearchTerm && (
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={clearMiniSearch}
                    className="h-7 w-7 p-0 hover:bg-muted"
                    animation="scale"
                  >
                    <X className="h-3 w-3" />
                  </AnimatedButton>
                )}
                <AnimatedButton
                  variant="ghost"
                  size="sm"
                  onClick={handleMiniSearch}
                  className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-foam"
                  animation="scale"
                >
                  <Search className="h-3 w-3" />
                </AnimatedButton>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {user && pathname !== "/create-deck" && (
            <Link href="/create-deck">
              <AnimatedButton
                variant="ghost"
                size="sm"
                animation="bounce"
                className="hover:bg-foam/10 hover:text-foam flex items-center justify-center"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create
              </AnimatedButton>
            </Link>
          )}

          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-rose/10 hover:text-rose"
                  animation="scale"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </AnimatedButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="animate-scale-in border-foam/20">
                <DropdownMenuLabel className="bg-gradient-to-r from-rose via-foam to-gold bg-clip-text text-transparent">
                  @{user.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-foam/20" />
                <Link href={`/profile/${user.username}`}>
                  <DropdownMenuItem className="hover:bg-foam/10 hover:text-foam transition-colors cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                {(user.role === "admin" || user.role === "moderator") && (
                  <Link href="/admin">
                    <DropdownMenuItem className="hover:bg-gold/10 hover:text-gold transition-colors cursor-pointer">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin/Mod Panel
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator className="bg-foam/20" />
                <DropdownMenuItem
                  onClick={logout}
                  className="hover:bg-rose/10 hover:text-rose transition-colors cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login">
                <AnimatedButton variant="ghost" size="sm" animation="scale">
                  Login
                </AnimatedButton>
              </Link>
              <Link href="/signup">
                <AnimatedButton size="sm" animation="glow">
                  Sign Up
                </AnimatedButton>
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <AnimatedButton variant="outline" size="icon" animation="scale">
                  <Menu className="h-5 w-5" />
                </AnimatedButton>
              </SheetTrigger>
              <SheetContent side="right" className="animate-slide-up">
                {/* Mobile mini search */}
                {isHomePage && showMiniSearch && (
                  <div className="mb-6 pt-4">
                    <div className="relative">
                      <Input
                        type="search"
                        placeholder="Quick search..."
                        value={miniSearchTerm}
                        onChange={(e) => setMiniSearchTerm(e.target.value)}
                        onKeyPress={handleMiniSearchKeyPress}
                        className="h-10 text-sm pr-16"
                      />
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        {miniSearchTerm && (
                          <AnimatedButton
                            variant="ghost"
                            size="sm"
                            onClick={clearMiniSearch}
                            className="h-8 w-8 p-0"
                            animation="scale"
                          >
                            <X className="h-3 w-3" />
                          </AnimatedButton>
                        )}
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          onClick={handleMiniSearch}
                          className="h-8 w-8 p-0"
                          animation="scale"
                        >
                          <Search className="h-3 w-3" />
                        </AnimatedButton>
                      </div>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col space-y-4 mt-8">
                  <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
                    Home
                  </Link>
                  {user ? (
                    <>
                      <Link
                        href={`/profile/${user.username}`}
                        className="text-lg font-medium hover:text-primary transition-colors"
                      >
                        Profile
                      </Link>
                      {(user.role === "admin" || user.role === "moderator") && (
                        <Link href="/admin" className="text-lg font-medium hover:text-primary transition-colors">
                          Admin/Mod
                        </Link>
                      )}
                      <AnimatedButton
                        onClick={logout}
                        variant="ghost"
                        className="w-full justify-start text-lg font-medium"
                        animation="scale"
                      >
                        <LogOut className="mr-2 h-5 w-5" /> Sign Out
                      </AnimatedButton>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <AnimatedButton
                          variant="ghost"
                          className="w-full justify-start text-lg font-medium"
                          animation="scale"
                        >
                          <LogIn className="mr-2 h-5 w-5" /> Login
                        </AnimatedButton>
                      </Link>
                      <Link href="/signup">
                        <AnimatedButton className="w-full justify-start text-lg font-medium" animation="glow">
                          <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                        </AnimatedButton>
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
