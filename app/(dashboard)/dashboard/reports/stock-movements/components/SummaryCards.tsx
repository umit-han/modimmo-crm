// components/reports/stock-movement/SummaryCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ArrowUpDown, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { TransferStatus, AdjustmentType } from "@prisma/client";
import { Grid } from "@/components/ui/grid";

interface TransferStatsProps {
  transferStats: {
    totalTransfers: number;
    totalQuantityMoved: number;
    transferCountsByStatus: Array<{
      status: TransferStatus;
      _count: { id: number };
    }>;
  };
}

interface AdjustmentStatsProps {
  adjustmentStats: {
    totalAdjustments: number;
    totalQuantityAdjusted: number;
    positiveAdjustments: number;
    negativeAdjustments: number;
  };
}

// Combined summary cards for overview tab
export function SummaryCards({
  transferStats,
  adjustmentStats,
}: TransferStatsProps & AdjustmentStatsProps) {
  // Calculate completed transfers
  const completedTransfers =
    transferStats.transferCountsByStatus.find(
      (t) => t.status === TransferStatus.COMPLETED
    )?._count.id || 0;

  // Calculate completion rate
  const completionRate =
    transferStats.totalTransfers > 0
      ? ((completedTransfers / transferStats.totalTransfers) * 100).toFixed(1)
      : "0";

  return (
    <Grid columns={4} gap={6} className="mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Stock Transfers
          </CardTitle>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {transferStats.totalTransfers}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Items Transferred
          </CardTitle>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {transferStats.totalQuantityMoved.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total quantity moved between locations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Stock Adjustments
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {adjustmentStats.totalAdjustments}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total adjustment transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Net Adjustment</CardTitle>
          {adjustmentStats.positiveAdjustments >
          adjustmentStats.negativeAdjustments ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {(
              adjustmentStats.positiveAdjustments -
              adjustmentStats.negativeAdjustments
            ).toLocaleString()}
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span className="text-green-500">
              +{adjustmentStats.positiveAdjustments.toLocaleString()}
            </span>
            <span className="text-red-500">
              -{adjustmentStats.negativeAdjustments.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Grid>
  );
}

// Transfers summary cards for transfers tab
export function TransferSummaryCards({ transferStats }: TransferStatsProps) {
  // Get counts by status
  const getStatusCount = (status: TransferStatus) => {
    return (
      transferStats.transferCountsByStatus.find((t) => t.status === status)
        ?._count.id || 0
    );
  };

  const pendingTransfers =
    getStatusCount(TransferStatus.DRAFT) +
    getStatusCount(TransferStatus.APPROVED);

  const inTransitCount = getStatusCount(TransferStatus.IN_TRANSIT);
  const completedCount = getStatusCount(TransferStatus.COMPLETED);
  const cancelledCount = getStatusCount(TransferStatus.CANCELLED);

  // Calculate completion rate
  const completionRate =
    transferStats.totalTransfers > 0
      ? ((completedCount / transferStats.totalTransfers) * 100).toFixed(1)
      : "0";

  return (
    <Grid columns={4} gap={6} className="mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {transferStats.totalTransfers}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Transfers
          </CardTitle>
          <FileText className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{pendingTransfers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Drafts and approved transfers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{inTransitCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Items currently moving between locations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Quantity Moved</CardTitle>
          <ArrowUpDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {transferStats.totalQuantityMoved.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total items transferred
          </p>
        </CardContent>
      </Card>
    </Grid>
  );
}

// Adjustments summary cards for adjustments tab
export function AdjustmentSummaryCards({
  adjustmentStats,
}: AdjustmentStatsProps) {
  // Calculate net adjustment
  const netAdjustment =
    adjustmentStats.positiveAdjustments - adjustmentStats.negativeAdjustments;

  // Calculate percentages
  const positivePercentage =
    adjustmentStats.totalQuantityAdjusted > 0
      ? (
          (adjustmentStats.positiveAdjustments /
            adjustmentStats.totalQuantityAdjusted) *
          100
        ).toFixed(1)
      : "0";

  const negativePercentage =
    adjustmentStats.totalQuantityAdjusted > 0
      ? (
          (adjustmentStats.negativeAdjustments /
            adjustmentStats.totalQuantityAdjusted) *
          100
        ).toFixed(1)
      : "0";

  return (
    <Grid columns={4} gap={6} className="mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Adjustments
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {adjustmentStats.totalAdjustments}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all locations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Adjusted</CardTitle>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {adjustmentStats.totalQuantityAdjusted.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sum of absolute adjustments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Stock Increase</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {adjustmentStats.positiveAdjustments.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {positivePercentage}% of total adjustments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Stock Decrease</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {adjustmentStats.negativeAdjustments.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {negativePercentage}% of total adjustments
          </p>
        </CardContent>
      </Card>
    </Grid>
  );
}
