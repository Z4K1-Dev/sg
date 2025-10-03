import DashboardLayout from '@/components/admin/dashboard-layout';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your application settings</p>
      </div>
    </DashboardLayout>
  );
}