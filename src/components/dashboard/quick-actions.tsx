import { DashboardButton } from './dashboard-button';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {actions.map((action, index) => (
        <div 
          key={index} 
          className="border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
          onClick={action.onClick}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              {action.icon}
            </div>
            <div>
              <h3 className="font-medium">{action.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}