import { cn } from '@/lib/utils'

interface QuickActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick?: () => void
  className?: string
}

export function QuickActionCard({ icon, title, description, onClick, className }: QuickActionCardProps) {
  return (
    <div className={cn('quick-action-card', className)} onClick={onClick}>
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

interface QuickActionsProps {
  actions: {
    icon: React.ReactNode
    title: string
    description: string
    onClick?: () => void
  }[]
  className?: string
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={cn('quick-actions', className)}>
      {actions.map((action, index) => (
        <QuickActionCard
          key={index}
          icon={action.icon}
          title={action.title}
          description={action.description}
          onClick={action.onClick || (() => {})}
        />
      ))}
    </div>
  )
}