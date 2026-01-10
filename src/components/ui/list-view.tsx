import Link from "next/link"

interface ListViewProps<T extends { id: string }> {
  data: T[]
  fields: {
    key: string
    label: string
    render?: (item: T) => React.ReactNode
  }[]
  getHref: (item: T) => string
  emptyMessage?: string
  emptyIcon?: React.ReactNode
}

export function ListView<T extends { id: string }>({ 
  data, 
  fields, 
  getHref, 
  emptyMessage = "No items found.", 
  emptyIcon 
}: ListViewProps<T>) {
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
                      {field.render ? field.render(item) : (item as Record<string, unknown>)[field.key] as React.ReactNode}
                    </Link>
                  ) : (
                    <span className="text-foreground">
                      {field.render ? field.render(item) : (item as Record<string, unknown>)[field.key] as React.ReactNode}
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