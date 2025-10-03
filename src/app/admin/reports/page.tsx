import DashboardLayout from '@/components/admin/dashboard-layout';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold">Reports Management</h1>
        <p className="text-muted-foreground">Manage user reports here</p>
      </div>
    </DashboardLayout>
  );
}