"use client"

import Link from "next/link"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface SortableListViewProps {
  data: any[]
  fields: {
    key: string
    label: string
    render?: (item: any) => React.ReactNode
    sortable?: boolean
  }[]
  getHref: (item: any) => string
  emptyMessage?: string
  emptyIcon?: React.ReactNode
}

export function SortableListView({ 
  data, 
  fields, 
  getHref, 
  emptyMessage = "No items found.", 
  emptyIcon 
}: SortableListViewProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  const sortedData = sortConfig ? [...data].sort((a, b) => {
    const field = fields.find(f => f.key === sortConfig.key)
    let aValue = a[sortConfig.key]
    let bValue = b[sortConfig.key]
    
    // Handle nested properties (like manufacturers.name)
    if (sortConfig.key === 'manufacturer') {
      aValue = a.manufacturers?.name || 'Unknown'
      bValue = b.manufacturers?.name || 'Unknown'
    }
    
    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = ''
    if (bValue === null || bValue === undefined) bValue = ''
    
    // Handle dates
    if (sortConfig.key === 'updated_at' || sortConfig.key === 'introduced_year') {
      aValue = aValue ? (aValue instanceof Date ? aValue : new Date(aValue)) : new Date(0)
      bValue = bValue ? (bValue instanceof Date ? bValue : new Date(bValue)) : new Date(0)
    }
    
    // Handle numbers
    if (sortConfig.key === 'introduced_year') {
      aValue = aValue ? Number(aValue) : 0
      bValue = bValue ? Number(bValue) : 0
    }
    
    // Handle models count
    if (sortConfig.key === 'models') {
      aValue = a._count?.models || 0
      bValue = b._count?.models || 0
    }
    
    let result = 0
    if (aValue < bValue) result = -1
    if (aValue > bValue) result = 1
    
    return sortConfig.direction === 'desc' ? -result : result
  }) : data

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {fields.map((field) => (
              <th
                key={field.key}
                className={`px-4 py-3 text-left text-sm font-medium text-foreground ${
                  field.sortable !== false ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''
                }`}
                onClick={field.sortable !== false ? () => handleSort(field.key) : undefined}
              >
                <div className="flex items-center gap-1">
                  {field.label}
                  {field.sortable !== false && (
                    <div className="flex flex-col">
                      {sortConfig && sortConfig.key === field.key && sortConfig.direction === 'desc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : sortConfig && sortConfig.key === field.key && sortConfig.direction === 'asc' ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4 opacity-30" />
                      )}
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr
              key={item.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              {fields.map((field, index) => (
                <td key={field.key} className="px-4 py-4 text-sm">
                  {index === 0 ? (
                    <Link
                      href={getHref(item)}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      {field.render ? field.render(item) : item[field.key]}
                    </Link>
                  ) : (
                    <span className="text-foreground">
                      {field.render ? field.render(item) : item[field.key]}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}