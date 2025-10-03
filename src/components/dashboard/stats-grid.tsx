import { cn } from '@/lib/utils';

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", className)}>
      {children}
    </div>
  );
}