import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface DashboardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
}

export function DashboardButton({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className,
  ...props 
}: DashboardButtonProps) {
  return (
    <button
      className={cn(
        'btn-dashboard',
        {
          'btn-dashboard-primary': variant === 'primary',
          'btn-dashboard-outline': variant === 'outline',
          'btn-dashboard-sm': size === 'sm',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface StatusBadgeProps {
  status: 'published' | 'draft' | 'pending' | 'archived'
  children?: ReactNode
  className?: string
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const statusMap = {
    published: 'status-published',
    draft: 'status-draft',
    pending: 'status-pending',
    archived: 'status-archived',
  }

  return (
    <span className={cn('status-badge', statusMap[status], className)}>
      {children || status}
    </span>
  )
}