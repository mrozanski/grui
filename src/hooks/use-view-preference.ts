"use client"

import { useState, useEffect } from 'react'

export type ViewType = 'cards' | 'list'

interface UseViewPreferenceProps {
  storageKey: string
  defaultView?: ViewType
}

export function useViewPreference({ 
  storageKey, 
  defaultView = 'cards' 
}: UseViewPreferenceProps) {
  const [currentView, setCurrentView] = useState<ViewType>(defaultView)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored && (stored === 'cards' || stored === 'list')) {
        setCurrentView(stored as ViewType)
      }
    } catch (error) {
      console.warn('Failed to load view preference from localStorage:', error)
    }
    setIsLoaded(true)
  }, [storageKey])

  const setView = (view: ViewType) => {
    setCurrentView(view)
    try {
      localStorage.setItem(storageKey, view)
    } catch (error) {
      console.warn('Failed to save view preference to localStorage:', error)
    }
  }

  return {
    currentView,
    setView,
    isLoaded
  }
}