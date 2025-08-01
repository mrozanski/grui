"use client"

import { Navbar } from "./navbar"

export function Header() {
  return (
    <header className="border-b border-border bg-surface px-6 pt-4 pb-2 relative">
      <div className="flex flex-col items-center justify-center max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-brand text-[var(--brand-color)] text-center">
            <span className="text-lg">ELECTRIC</span><br ></br>GUITAR REGISTRY
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            The Lore Of The Strings
          </p>
        </div>
        <div className="w-full flex justify-center">
          <Navbar />
        </div>
      </div>
    </header>
  )
}