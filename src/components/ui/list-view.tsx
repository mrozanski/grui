import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface ListViewProps {
  data: any[]
  fields: {
    key: string
    label: string
    render?: (item: any) => React.ReactNode
  }[]
  getHref: (item: any) => string
  emptyMessage?: string
  emptyIcon?: React.ReactNode
}

export function ListView({ 
  data, 
  fields, 
  getHref, 
  emptyMessage = "No items found.", 
  emptyIcon 
}: ListViewProps) {
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
                className="px-4 py-3 text-left text-sm font-medium text-foreground"
              >
                {field.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
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