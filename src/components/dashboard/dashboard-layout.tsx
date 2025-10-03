'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Header,
  Sidebar
} from './dashboard-parts';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  userName?: string;
  userAvatar?: string;
}

export function DashboardLayout({ children, title = "Admin Dashboard", userName, userAvatar }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        userName={userName}
        userAvatar={userAvatar}
      />

      {/* Main content */}
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        {/* Header */}
        <Header
          title={title}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main content area with scrolling */}
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;