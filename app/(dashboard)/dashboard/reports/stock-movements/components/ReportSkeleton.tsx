// components/reports/ReportSkeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Grid } from "@/components/ui/grid";

import { Skeleton } from "@/components/ui/skeleton";

export function ReportSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <Grid columns={4} gap={6} className="mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-[140px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-2" />
              <Skeleton className="h-4 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </Grid>

      {/* Charts Skeleton */}
      <Grid columns={2} gap={6}>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-[180px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[240px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-[180px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[240px] w-full" />
          </CardContent>
        </Card>
      </Grid>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[150px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
