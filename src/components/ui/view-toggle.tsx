"use client"

import { Button } from "@/components/ui/button"
import { Grid3X3, List } from "lucide-react"

export type ViewType = 'cards' | 'list'

interface ViewToggleProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-[4px] border border-border bg-card p-1">
      <Button
        variant={currentView === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className="flex items-center gap-2"
      >
        <Grid3X3 className="h-4 w-4" />
        Cards
      </Button>
      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="flex items-center gap-2"
      >
        <List className="h-4 w-4" />
        List
      </Button>
    </div>
  )
}