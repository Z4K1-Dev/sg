import DashboardLayout from '@/components/admin/dashboard-layout';

export default function MediaPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold">Media Management</h1>
        <p className="text-muted-foreground">Manage your media files here</p>
      </div>
    </DashboardLayout>
  );
}