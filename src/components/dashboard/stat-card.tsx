import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatChange {
  value: string;
  type: 'positive' | 'negative' | 'neutral';
}

interface StatCardProps {
  title: string;
  value: string;
  change?: StatChange;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-xl border p-6 shadow-sm transition-all hover:shadow-md",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        {icon && <div className="p-3 bg-primary/10 rounded-lg text-primary">{icon}</div>}
      </div>
      
      {change && (
        <div className="flex items-center mt-4 text-sm">
          {change.type === 'positive' ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : change.type === 'negative' ? (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          ) : null}
          <span className={cn(
            "font-medium",
            change.type === 'positive' ? 'text-green-500' :
            change.type === 'negative' ? 'text-red-500' : 'text-muted-foreground'
          )}>
            {change.value}
          </span>
        </div>
      )}
    </div>
  );
}