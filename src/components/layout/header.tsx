"use client"

export function Header() {
  return (
    <header className="border-b border-border bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900">
            Guitar Registry
          </h1>
          <p className="text-sm text-gray-700">
            Electric guitar provenance and authentication system
          </p>
        </div>
      </div>
    </header>
  )
}