// app/dashboard/reports/stock-movement/page.tsx
import { Suspense } from "react";
import { getStockMovementReport } from "@/actions/reports";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { DateRangePickerForm } from "./components/DateRangeFilter";
import { ReportSkeleton } from "./components/ReportSkeleton";
import StockMovementReport, {
  StockData,
} from "./components/StockMovementReport";
import { getAuthenticatedUser } from "@/config/useAuth";

export default async function StockMovementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getAuthenticatedUser();
  const orgId = user.orgId;
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

  // Fetch report data
  const reportData = (await getStockMovementReport(
    orgId,
    period,
    fromDate,
    toDate
  )) as any;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        heading="Stock Movement Report"
        description="Track transfers and adjustments to monitor inventory flow across locations"
      />

      <div className="flex justify-end">
        <DateRangePickerForm
          initialFromDate={fromDate}
          initialToDate={toDate}
          initialPeriod={period}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={<ReportSkeleton />}>
            <StockMovementReport data={reportData} view="overview" />
          </Suspense>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <Suspense fallback={<ReportSkeleton />}>
            <StockMovementReport data={reportData} view="transfers" />
          </Suspense>
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-6">
          <Suspense fallback={<ReportSkeleton />}>
            <StockMovementReport data={reportData} view="adjustments" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
