import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'positive' | 'negative'
  }
  className?: string
}

export function StatCard({ title, value, change, className }: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <h3>{title}</h3>
      <div className="value">{value}</div>
      {change && (
        <div className={cn('change', change.type)}>
          <span>{change.type === 'positive' ? '↑' : '↓'}</span>
          <span>{change.value}</span>
        </div>
      )}
    </div>
  )
}

interface StatsGridProps {
  children: React.ReactNode
  className?: string
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div className={cn('stats-grid', className)}>
      {children}
    </div>
  )
}