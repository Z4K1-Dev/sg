"use client"

import { useState, useEffect } from 'react'
import { Menu, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  userName?: string
  userAvatar?: string
}

export function DashboardLayout({ 
  children, 
  title = "Blog Admin", 
  userName = "John Doe",
  userAvatar = "JD"
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Check for saved sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved === 'true') {
      setSidebarCollapsed(true)
    }
  }, [])

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    
    setIsDarkMode(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newTheme)
  }

  const sidebarItems = [
    { icon: '📊', label: 'Dashboard', href: '#', active: true },
    { icon: '📝', label: 'Posts', href: '#' },
    { icon: '📄', label: 'Pages', href: '#' },
    { icon: '💬', label: 'Comments', href: '#' },
    { icon: '👥', label: 'Users', href: '#' },
    { icon: '📷', label: 'Media', href: '#' },
    { icon: '⚙️', label: 'Settings', href: '#' },
  ]

  return (
    <div className={cn('dashboard', sidebarCollapsed && 'sidebar-collapsed')}>
      {/* Header */}
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="menu-toggle" 
            onClick={toggleSidebar}
            title="Toggle menu"
          >
            <Menu size={24} />
          </button>
          <h1>{title}</h1>
        </div>
        <div className="header-actions">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="user-profile">
            <div className="user-avatar">
              {userAvatar}
            </div>
            <span>{userName}</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <nav>
          <ul className="sidebar-nav">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <a 
                  href={item.href} 
                  className={cn(item.active && 'active')}
                  onClick={(e) => {
                    e.preventDefault()
                    // Handle navigation
                  }}
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  )
}