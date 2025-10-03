'use client';

import { useState } from 'react';
import { UserNav } from './user-nav';
import { Sidebar } from './sidebar';
import { Breadcrumbs } from './breadcrumbs';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />

      {/* Main content */}
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        {/* Header */}
        <header className="border-b h-16 flex items-center px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-muted"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <Breadcrumbs />
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}