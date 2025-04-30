// components/ui/grid.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  children: React.ReactNode;
}

export function Grid({
  columns = 1,
  gap = 4,
  className,
  children,
  ...props
}: GridProps) {
  // Map the columns number to tailwind grid-cols classes
  const colsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6",
  };

  // Map the gap number to tailwind gap classes
  const gapMap = {
    0: "gap-0",
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
    8: "gap-8",
    10: "gap-10",
    12: "gap-12",
  };

  return (
    <div
      className={cn("grid", colsMap[columns], gapMap[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}
