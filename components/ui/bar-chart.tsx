"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface BarChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
  height?: number;
  valueFormatter?: (value: number) => string;
  chartColors?: string[];
}

export function BarChart({
  data,
  className,
  showLabels = true,
  showValues = true,
  height = 200,
  valueFormatter = (value) => value.toLocaleString(),
  chartColors = [
    "bg-primary",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-red-500",
  ],
}: BarChartProps) {
  const [mounted, setMounted] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Get max value for scaling
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  // Calculate bar width based on data length
  const barWidth = data.length <= 5 ? 40 : data.length <= 10 ? 32 : 24;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation effect when mounted
  useEffect(() => {
    if (!mounted || !chartRef.current) return;

    const bars = chartRef.current.querySelectorAll(".chart-bar");

    bars.forEach((bar, index) => {
      setTimeout(() => {
        (bar as HTMLElement).style.height =
          `${(data[index].value / maxValue) * 100}%`;
      }, index * 50);
    });
  }, [mounted, data, maxValue]);

  return (
    <div className={cn("w-full", className)} style={{ height: `${height}px` }}>
      <div className="relative h-full w-full">
        {/* Y-axis (optional) */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-muted-foreground">
          <span>{valueFormatter(maxValue)}</span>
          <span>{valueFormatter(maxValue / 2)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div
          ref={chartRef}
          className="absolute left-12 right-0 top-0 bottom-6 flex items-end justify-around"
        >
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`chart-bar ${item.color || chartColors[index % chartColors.length]} rounded-t transition-all duration-500 ease-out`}
                style={{
                  width: `${barWidth}px`,
                  height: "0%", // Start at 0 for animation
                }}
              >
                {showValues && (
                  <div className="text-xs font-medium text-center -mt-6">
                    {valueFormatter(item.value)}
                  </div>
                )}
              </div>
              {showLabels && (
                <div className="text-xs mt-2 text-muted-foreground max-w-[60px] text-center truncate">
                  {item.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
