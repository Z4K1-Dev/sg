import DashboardLayout from '@/components/admin/dashboard-layout';

export default function TagsPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold">Tags Management</h1>
        <p className="text-muted-foreground">Manage your post tags here</p>
      </div>
    </DashboardLayout>
  );
}