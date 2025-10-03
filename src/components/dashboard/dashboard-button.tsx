import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface DashboardButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export function DashboardButton({ children, className, ...props }: DashboardButtonProps) {
  return (
    <Button className={cn("", className)} {...props}>
      {children}
    </Button>
  );
}