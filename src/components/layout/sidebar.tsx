"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  
  { name: "Market Valuations", href: "/valuations", icon: TrendingUp },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-background-contrast">
      <div className="flex h-16 items-center px-6">
        <Guitar className="h-8 w-8 text-white" />
        <span className="ml-3 text-xl font-brand text-white">
          Electric Guitar Registry
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-[4px] px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}