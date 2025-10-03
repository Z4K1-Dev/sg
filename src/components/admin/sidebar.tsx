'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Posts', href: '/admin/posts', icon: '📝' },
  { name: 'Pages', href: '/admin/pages', icon: '📄' },
  { name: 'Categories', href: '/admin/categories', icon: '🏷️' },
  { name: 'Tags', href: '/admin/tags', icon: '🔖' },
  { name: 'Media', href: '/admin/media', icon: '🖼️' },
  { name: 'Reports', href: '/admin/reports', icon: '📋' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 z-50 w-64 bg-background border-r transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:translate-y-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold">
              <span className="text-xl">🏢</span>
              <span>SmartGov Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start px-4 py-3 rounded-lg",
                        pathname === item.href || pathname.startsWith(item.href) 
                          ? "bg-accent text-accent-foreground" 
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <span className="mr-3">🚪</span>
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}