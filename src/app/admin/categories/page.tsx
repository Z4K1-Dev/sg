import DashboardLayout from '@/components/admin/dashboard-layout';

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <p className="text-muted-foreground">Manage your post categories here</p>
      </div>
    </DashboardLayout>
  );
}