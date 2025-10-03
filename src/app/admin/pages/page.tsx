import DashboardLayout from '@/components/admin/dashboard-layout';

export default function PagesPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold">Pages Management</h1>
        <p className="text-muted-foreground">Manage your static pages here</p>
      </div>
    </DashboardLayout>
  );
}