// components/reports/stock-movement/AdjustmentTypeChart.tsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AdjustmentType } from "@prisma/client";

interface AdjustmentTypeChartProps {
  data: Array<{
    adjustmentType: AdjustmentType;
    _count: { id: number };
  }>;
}

// Map adjustment types to human-readable labels
const typeLabels: Record<AdjustmentType, string> = {
  STOCK_COUNT: "Stock Count",
  DAMAGE: "Damage",
  THEFT: "Theft",
  EXPIRED: "Expired",
  WRITE_OFF: "Write Off",
  CORRECTION: "Correction",
  OTHER: "Other",
};

// Define colors for each adjustment type
const typeColors: Record<AdjustmentType, string> = {
  STOCK_COUNT: "#60a5fa", // blue-400
  DAMAGE: "#f87171", // red-400
  THEFT: "#f43f5e", // rose-500
  EXPIRED: "#fb923c", // orange-400
  WRITE_OFF: "#a855f7", // purple-500
  CORRECTION: "#22c55e", // green-500
  OTHER: "#94a3b8", // slate-400
};

export function AdjustmentTypeChart({ data }: AdjustmentTypeChartProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    name: typeLabels[item.adjustmentType] || item.adjustmentType,
    value: item._count.id,
    type: item.adjustmentType,
  }));

  // Sort data by value in descending order to show most common types first
  chartData.sort((a, b) => b.value - a.value);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={typeColors[entry.type as AdjustmentType] || "#94a3b8"}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconSize={8}
            iconType="circle"
            formatter={(value) => <span className="text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
