import { Suspense } from "react";

import { getDashboardData } from "@/actions/dashboard";
import { MetricsLoader } from "@/components/dashboard/overview/MetricsLoader";
import InventoryMetricsDisplay from "@/components/dashboard/overview/InventoryMetricsDisplay";
import { getAuthenticatedUser } from "@/config/useAuth";
import DefaultUserDashboard from "@/components/dashboard/DefaultUserDashboard";
import { Calendar } from "lucide-react";

export default async function DashboardPage() {
  // Fetch data server-side
  const dashboardData = await getDashboardData();
  const user = await getAuthenticatedUser();
  const userPermissions = user.permissions;
  if (!userPermissions.includes("dashboard.read")) {
    return <DefaultUserDashboard user={user} />;
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center border-b pb-4 justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Metrics Section */}
        <section className="space-y-4">
          <Suspense fallback={<MetricsLoader />}>
            <InventoryMetricsDisplay data={dashboardData} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
