import DashboardLayout from '@/components/admin/dashboard-layout';

export default function PostsPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold">Posts Management</h1>
        <p className="text-muted-foreground">Manage your blog posts here</p>
      </div>
    </DashboardLayout>
  );
}