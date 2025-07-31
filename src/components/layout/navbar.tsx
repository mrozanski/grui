"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { 
  Guitar, 
  Factory, 
  Package, 
  FileText, 
  Users, 
  TrendingUp,
  Home 
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Manufacturers", href: "/manufacturers", icon: Factory },
  { name: "Product Lines", href: "/product-lines", icon: Package },
  { name: "Models", href: "/models", icon: FileText },
  { name: "Individual Guitars", href: "/guitars", icon: Guitar },
  { name: "Notable Associations", href: "/associations", icon: Users },
  { name: "Market Valuations", href: "/valuations", icon: TrendingUp },
]

export function Navbar() {
  return (
    <div className="flex flex-items-center">
      <nav className="flex flex-row px-3 pt-5">
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
    </div>
  )
}