"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { 
  Guitar, 
  Factory, 
  Package, 
  FileText, 
  Users, 
  TrendingUp,
  Home,
  Menu,
  X
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Manufacturers", href: "/manufacturers", icon: Factory },
  { name: "Product Lines", href: "/product-lines", icon: Package },
  { name: "Models", href: "/models", icon: FileText },
  { name: "Individual Guitars", href: "/guitars", icon: Guitar },
  { name: "Create Attestation", href: "/create-review-demo?open=true", icon: TrendingUp },
]

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="flex items-center">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-row px-3 pt-5">
        {navigation.map((item) => {
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-[4px] px-3 py-0 text-sm font-medium transition-colors text-muted-foreground hover:text-[var(--primary-hover-color)]",
              )}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Hamburger Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-[4px] text-muted-foreground hover:text-[var(--primary-hover-color)] transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-surface border-b border-border shadow-lg z-50">
            <nav className="flex flex-col px-3 py-4">
              {navigation.map((item) => {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "group flex items-center rounded-[4px] px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:text-[var(--primary-hover-color)] hover:bg-muted/50",
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}