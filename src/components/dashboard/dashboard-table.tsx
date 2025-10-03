import { cn } from '@/lib/utils'

export interface TableColumn {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

export interface TableData {
  [key: string]: any
}

interface DashboardTableProps {
  columns: TableColumn[]
  data: TableData[]
  className?: string
}

export function DashboardTable({ columns, data, className }: DashboardTableProps) {
  return (
    <table className={cn('dashboard-table', className)}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, colIndex) => (
              <td key={colIndex}>
                {column.render 
                  ? column.render(row[column.key], row)
                  : row[column.key]
                }
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface ContentSectionProps {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ContentSection({ title, action, children, className }: ContentSectionProps) {
  return (
    <div className={cn('content-section', className)}>
      <div className="section-header">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}