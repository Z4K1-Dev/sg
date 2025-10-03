'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs } from './breadcrumbs';
import { ThemeToggle } from './theme-toggle';
import { UserNav } from './user-nav';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userName?: string | undefined;
  userAvatar?: string | undefined;
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

export function Sidebar({ isOpen, onToggle, userName, userAvatar }: SidebarProps) {
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

          {/* User Profile */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {userAvatar || userName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{userName || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface HeaderProps {
  title: string;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export function Header({ title, onSidebarToggle }: HeaderProps) {
  return (
    <header className="border-b bg-background h-16 flex items-center px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={onSidebarToggle}
            className="p-2 rounded-md hover:bg-muted"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <Breadcrumbs />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}