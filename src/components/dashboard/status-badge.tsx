import { cn } from '@/lib/utils';

type StatusType = 'published' | 'draft' | 'pending' | 'archived';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  published: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  pending: "bg-orange-100 text-orange-800 border-orange-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      statusStyles[status],
      className
    )}>
      {statusText}
    </span>
  );
}