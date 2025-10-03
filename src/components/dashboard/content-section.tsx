import { cn } from '@/lib/utils';

interface ContentSectionProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ContentSection({ title, action, children, className }: ContentSectionProps) {
  return (
    <div className={cn("bg-card rounded-xl border shadow-sm mb-6", className)}>
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}