// app/dashboard/reports/sales/page.tsx
import { Suspense } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getAuthenticatedUser } from "@/config/useAuth";
import { getSalesReport } from "@/actions/salesReport";
import { DateRangePickerForm } from "../stock-movements/components/DateRangeFilter";
import { ReportSkeleton } from "../stock-movements/components/ReportSkeleton";
import SalesReport from "./components/SalesReport";

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Parse and validate search params
  const period =
    ((await searchParams).period as "daily" | "weekly" | "monthly") ||
    "monthly";

  const from = (await searchParams).fromDate as string;
  const to = (await searchParams).toDate as string;
  let fromDate: Date | undefined;
  let toDate: Date | undefined;
  if (from) {
    fromDate = new Date(from);
  }

  if (to) {
    toDate = new Date(to);
  }
  const view = ((await searchParams).view as string) || "summary";
  const user = await getAuthenticatedUser();
  const orgId = user.orgId;
  // Fetch report data
  const reportData = (await getSalesReport(
    orgId,
    period,
    fromDate,
    toDate
  )) as any;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        heading="Sales Report"
        description="Analyze sales performance by summary, customers, and products"
      />

      <div className="flex justify-end">
        <DateRangePickerForm
          initialFromDate={fromDate}
          initialToDate={toDate}
          initialPeriod={period}
        />
      </div>

      <Tabs defaultValue={view} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="customers">Sales by Customer</TabsTrigger>
          <TabsTrigger value="items">Sales by Item</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Suspense fallback={<ReportSkeleton />}>
            <SalesReport data={reportData} view="summary" />
          </Suspense>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Suspense fallback={<ReportSkeleton />}>
            <SalesReport data={reportData} view="customers" />
          </Suspense>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Suspense fallback={<ReportSkeleton />}>
            <SalesReport data={reportData} view="items" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
