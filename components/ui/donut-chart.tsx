"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DonutChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  className?: string;
  size?: number;
  thickness?: number;
  showLabels?: boolean;
  valueFormatter?: (value: number) => string;
  centerContent?: React.ReactNode;
  chartColors?: string[];
}

export function DonutChart({
  data,
  className,
  size = 200,
  thickness = 30,
  showLabels = true,
  valueFormatter = (value) => value.toLocaleString(),
  centerContent,
  chartColors = [
    "hsl(221, 83%, 53%)",
    "hsl(245, 58%, 51%)",
    "hsl(142, 71%, 45%)",
    "hsl(50, 97%, 63%)",
    "hsl(283, 74%, 58%)",
    "hsl(330, 81%, 60%)",
    "hsl(36, 100%, 50%)",
    "hsl(0, 91%, 71%)",
  ],
}: DonutChartProps) {
  const [mounted, setMounted] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Animation effect
  useEffect(() => {
    setMounted(true);

    if (mounted) {
      let start: number | null = null;
      const duration = 1000; // Animation duration in ms

      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);

        setAnimationProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [mounted]);

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Generate SVG path for each segment
  const segments = data.map((item, index) => {
    const percentage = total > 0 ? item.value / total : 0;
    // Scale the angle based on animation progress
    const angle = 360 * percentage * animationProgress;

    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      const prevPercentage = total > 0 ? data[i].value / total : 0;
      startAngle += 360 * prevPercentage * animationProgress;
    }

    const endAngle = startAngle + angle;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const innerRadius = size / 2 - thickness;
    const outerRadius = size / 2;

    // Calculate coordinates
    const x1 = size / 2 + outerRadius * Math.cos(startRad);
    const y1 = size / 2 + outerRadius * Math.sin(startRad);
    const x2 = size / 2 + outerRadius * Math.cos(endRad);
    const y2 = size / 2 + outerRadius * Math.sin(endRad);
    const x3 = size / 2 + innerRadius * Math.cos(endRad);
    const y3 = size / 2 + innerRadius * Math.sin(endRad);
    const x4 = size / 2 + innerRadius * Math.cos(startRad);
    const y4 = size / 2 + innerRadius * Math.sin(startRad);

    // Use largeArcFlag to determine if the arc should be drawn the long way around
    const largeArcFlag = angle > 180 ? 1 : 0;

    // Create the SVG path
    const path = [
      `M ${x1} ${y1}`, // Move to the start point (outer edge)
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Draw outer arc
      `L ${x3} ${y3}`, // Line to inner edge
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`, // Draw inner arc (opposite direction)
      "Z", // Close path
    ].join(" ");

    return {
      path,
      color: item.color || chartColors[index % chartColors.length],
    };
  });

  return (
    <div className={cn("relative", className)}>
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              stroke="hsl(var(--background))"
              strokeWidth="1"
              className="transition-all duration-300"
            />
          ))}
          {/* Inner circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - thickness}
            fill="hsl(var(--background))"
          />
        </svg>

        {/* Center content */}
        {centerContent && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerContent}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLabels && (
        <div className="grid grid-cols-2 gap-2 mt-6">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    item.color || chartColors[index % chartColors.length],
                }}
              />
              <span className="truncate">{item.name}</span>
              <span className="text-muted-foreground ml-auto">
                {valueFormatter(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
