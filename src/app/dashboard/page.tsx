"use client"

import { 
  DashboardLayout, 
  StatCard, 
  StatsGrid, 
  ContentSection, 
  DashboardTable, 
  QuickActions, 
  DashboardButton, 
  StatusBadge 
} from '@/components/dashboard'
import { Plus, Edit, Trash2, FileText, BarChart3, MessageSquare, Upload } from 'lucide-react'

export default function DashboardPage() {
  // Sample data
  const postsData = [
    {
      title: 'Getting Started with Web Development',
      author: 'John Doe',
      status: 'published',
      date: '2024-01-15',
    },
    {
      title: 'Advanced CSS Techniques',
      author: 'Jane Smith',
      status: 'published',
      date: '2024-01-14',
    },
    {
      title: 'JavaScript Best Practices',
      author: 'Mike Johnson',
      status: 'draft',
      date: '2024-01-13',
    },
    {
      title: 'Building Responsive Layouts',
      author: 'Sarah Wilson',
      status: 'published',
      date: '2024-01-12',
    },
  ]

  const tableColumns = [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value as any} />
    },
    { key: 'date', label: 'Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="actions">
          <DashboardButton variant="outline" size="sm">
            <Edit size={14} />
            Edit
          </DashboardButton>
          <DashboardButton variant="outline" size="sm">
            <Trash2 size={14} />
            Delete
          </DashboardButton>
        </div>
      )
    }
  ]

  const quickActions = [
    {
      icon: <FileText size={24} />,
      title: 'New Post',
      description: 'Create a new blog post',
      onClick: () => console.log('New post clicked')
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'View Analytics',
      description: 'Check your blog stats',
      onClick: () => console.log('Analytics clicked')
    },
    {
      icon: <MessageSquare size={24} />,
      title: 'Moderate Comments',
      description: 'Review pending comments',
      onClick: () => console.log('Comments clicked')
    },
    {
      icon: <Upload size={24} />,
      title: 'Upload Media',
      description: 'Add images or files',
      onClick: () => console.log('Upload clicked')
    }
  ]

  return (
    <DashboardLayout title="Blog Admin Dashboard" userName="Admin User" userAvatar="AD">
      {/* Stats Grid */}
      <StatsGrid>
        <StatCard 
          title="Total Posts"
          value="142"
          change={{
            value: "12% from last month",
            type: "positive"
          }}
        />
        <StatCard 
          title="Total Views"
          value="24.5K"
          change={{
            value: "8% from last month",
            type: "positive"
          }}
        />
        <StatCard 
          title="Comments"
          value="89"
          change={{
            value: "3% from last month",
            type: "negative"
          }}
        />
        <StatCard 
          title="Active Users"
          value="1,234"
          change={{
            value: "15% from last month",
            type: "positive"
          }}
        />
      </StatsGrid>

      {/* Recent Posts */}
      <ContentSection 
        title="Recent Posts"
        action={
          <DashboardButton>
            <Plus size={16} />
            New Post
          </DashboardButton>
        }
      >
        <DashboardTable 
          columns={tableColumns}
          data={postsData}
        />
      </ContentSection>

      {/* Quick Actions */}
      <ContentSection title="Quick Actions">
        <QuickActions actions={quickActions} />
      </ContentSection>
    </DashboardLayout>
  )
}