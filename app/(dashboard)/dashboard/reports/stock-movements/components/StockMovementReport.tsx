// components/reports/stock-movement/StockMovementReport.tsx
"use client";

import {
  SummaryCards,
  TransferSummaryCards,
  AdjustmentSummaryCards,
} from "./SummaryCards";
import { TransferChart } from "./TransferChart";
import { AdjustmentChart } from "./AdjustmentChart";
import { TransferStatusChart } from "./TransferStatusChart";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TransferStatus, AdjustmentType } from "@/lib/constants/enums";
import { useState } from "react";
import { Grid } from "@/components/ui/grid";
import { RecentTransfersTable } from "./RecentTransfersTable";
import { AdjustmentTypeChart } from "./AdjustmentTypeChart";
import { RecentAdjustmentsTable } from "./RecentAdjustmentsTable";
import { TopAdjustedItemsTable } from "./TopAdjustmentsTable";
export type StockData = {
  transferStats: {
    totalTransfers: number;
    totalQuantityMoved: number;
    transferCountsByStatus: Array<{
      status: TransferStatus;
      _count: { id: number };
    }>;
    transfersByLocation: Array<{
      fromLocationId: string;
      toLocationId: string;
      _count: { id: number };
    }>;
    transferTrend: Array<{
      period: string;
      count: number;
    }>;
  };
  adjustmentStats: {
    totalAdjustments: number;
    totalQuantityAdjusted: number;
    positiveAdjustments: number;
    negativeAdjustments: number;
    adjustmentCountsByType: Array<{
      adjustmentType: AdjustmentType;
      _count: { id: number };
    }>;
    adjustmentsByLocation: Array<{
      locationId: string;
      adjustmentType: AdjustmentType;
      _count: { id: number };
    }>;
    adjustmentTrend: Array<{
      period: string;
      count: number;
    }>;
    topAdjustedItems: Array<{
      id: string;
      name: string;
      sku: string;
      count: number;
    }>;
  };
  recentTransfers: Array<{
    id: string;
    transferNumber: string;
    date: string;
    status: string;
    fromLocation: { id: string; name: string };
    toLocation: { id: string; name: string };
    createdBy: { id: string; name: string };
    totalQuantity: number;
  }>;
  recentAdjustments: Array<{
    id: string;
    adjustmentNumber: string;
    date: string;
    status: string;
    adjustmentType: string;
    reason: string;
    location: { id: string; name: string };
    createdBy: { id: string; name: string };
    netAdjustment: number;
  }>;
  locationNames: Record<string, string>;
};
interface StockMovementReportProps {
  data: StockData;
  view: "overview" | "transfers" | "adjustments";
}

export default function StockMovementReport({
  data,
  view,
}: StockMovementReportProps) {
  const {
    transferStats,
    adjustmentStats,
    recentTransfers,
    recentAdjustments,
    locationNames,
  } = data;

  // Render different views based on the selected tab
  if (view === "transfers") {
    return (
      <>
        <TransferSummaryCards transferStats={transferStats} />

        <Grid columns={2} gap={6}>
          <Card>
            <CardHeader>
              <CardTitle>Transfer Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <TransferChart data={transferStats.transferTrend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transfer Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <TransferStatusChart
                data={transferStats.transferCountsByStatus}
              />
            </CardContent>
          </Card>
        </Grid>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransfersTable transfers={recentTransfers} />
          </CardContent>
        </Card>
      </>
    );
  }

  if (view === "adjustments") {
    return (
      <>
        <AdjustmentSummaryCards adjustmentStats={adjustmentStats} />

        <Grid columns={2} gap={6}>
          <Card>
            <CardHeader>
              <CardTitle>Adjustment Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <AdjustmentChart data={adjustmentStats.adjustmentTrend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adjustment Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <AdjustmentTypeChart
                data={adjustmentStats.adjustmentCountsByType}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid columns={2} gap={6}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Adjustments</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentAdjustmentsTable adjustments={recentAdjustments} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Adjusted Items</CardTitle>
            </CardHeader>
            <CardContent>
              <TopAdjustedItemsTable items={adjustmentStats.topAdjustedItems} />
            </CardContent>
          </Card>
        </Grid>
      </>
    );
  }

  // Default overview
  return (
    <>
      <SummaryCards
        transferStats={transferStats}
        adjustmentStats={adjustmentStats}
      />

      <Grid columns={2} gap={6}>
        <Card>
          <CardHeader>
            <CardTitle>Stock Movement Trends</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Transfer Activity</h4>
              <TransferChart data={transferStats.transferTrend} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Adjustment Activity</h4>
              <AdjustmentChart data={adjustmentStats.adjustmentTrend} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Transfer Status</h4>
              <TransferStatusChart
                data={transferStats.transferCountsByStatus}
              />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Adjustment Types</h4>
              <AdjustmentTypeChart
                data={adjustmentStats.adjustmentCountsByType}
              />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid columns={1} gap={6}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransfersTable transfers={recentTransfers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentAdjustmentsTable adjustments={recentAdjustments} />
          </CardContent>
        </Card>
      </Grid>
    </>
  );
}
