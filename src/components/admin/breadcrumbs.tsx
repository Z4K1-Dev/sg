'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Generate breadcrumb items based on the current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname) return [{ label: 'Home' }];
    
    const pathParts = pathname.split('/').filter(part => part.length > 0);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
    
    let currentPath = '';
    
    for (const part of pathParts) {
      currentPath += `/${part}`;
      // Convert path part to a readable label
      const label = part
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      breadcrumbs.push({ label, href: currentPath });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className={cn("flex items-center text-sm text-muted-foreground", className)}>
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRightIcon className="h-4 w-4 mx-2 text-muted-foreground" />
          )}
          {item.href && index < breadcrumbs.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}