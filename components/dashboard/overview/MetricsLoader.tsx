// MetricsLoader.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TableLoader } from "./TableLoader";

export function MetricsLoader() {
  return (
    <div className="space-y-6">
      {/* First row skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div className="h-5 bg-muted rounded animate-pulse w-1/3 mb-4"></div>
                <div className="h-5 w-5 bg-muted rounded-full animate-pulse"></div>
              </div>
              <div className="h-8 bg-muted rounded animate-pulse w-3/4 mb-4"></div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j}>
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2 mb-1"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Second row skeleton */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-muted rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-5 bg-muted rounded animate-pulse w-24"></div>
                  <div className="h-7 bg-muted rounded animate-pulse w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}

      {/* Key metrics skeleton */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div className="h-5 bg-muted rounded animate-pulse w-1/2"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-7 bg-muted rounded animate-pulse w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div> */}

      {/* Tables skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <TableLoader key={i} />
        ))}
      </div>

      {/* Bottom tables skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <TableLoader key={i} />
        ))}
      </div>
    </div>
  );
}
