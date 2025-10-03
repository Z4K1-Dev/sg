import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';

export interface DashboardButtonProps 
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children: React.ReactNode;
}

export function DashboardButton({ 
  children, 
  className, 
  variant, 
  size, 
  asChild, 
  ...props 
}: DashboardButtonProps) {
  return (
    <Button 
      className={cn("", className)} 
      variant={variant} 
      size={size} 
      asChild={asChild ?? false}
      {...props}
    >
      {children}
    </Button>
  );
}