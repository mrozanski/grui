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
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {fields.map((field) => (
              <th
                key={field.key}
                className="px-4 py-3 text-left text-sm font-medium text-gray-900"
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
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {fields.map((field, index) => (
                <td key={field.key} className="px-4 py-4 text-sm">
                  {index === 0 ? (
                    <Link
                      href={getHref(item)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {field.render ? field.render(item) : item[field.key]}
                    </Link>
                  ) : (
                    <span className="text-gray-900">
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