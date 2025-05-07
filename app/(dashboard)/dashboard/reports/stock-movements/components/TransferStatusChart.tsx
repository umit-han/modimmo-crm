// components/reports/stock-movement/TransferStatusChart.tsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TransferStatus } from "@/lib/constants/enums";

interface TransferStatusChartProps {
  data: Array<{
    status: TransferStatus;
    _count: { id: number };
  }>;
}

// Map transfer status to human-readable labels
const statusLabels: Record<TransferStatus, string> = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  IN_TRANSIT: "In Transit",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Define colors for each status
const statusColors: Record<TransferStatus, string> = {
  DRAFT: "#94a3b8", // slate-400
  APPROVED: "#60a5fa", // blue-400
  IN_TRANSIT: "#facc15", // yellow-400
  COMPLETED: "#4ade80", // green-400
  CANCELLED: "#f87171", // red-400
};

export function TransferStatusChart({ data }: TransferStatusChartProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    name: statusLabels[item.status] || item.status,
    value: item._count.id,
    status: item.status,
  }));

  // Sort data by status order for consistency
  const statusOrder = [
    TransferStatus.DRAFT,
    TransferStatus.APPROVED,
    TransferStatus.IN_TRANSIT,
    TransferStatus.COMPLETED,
    TransferStatus.CANCELLED,
  ];

  chartData.sort(
    (a, b) =>
      statusOrder.indexOf(a.status as TransferStatus) -
      statusOrder.indexOf(b.status as TransferStatus)
  );

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
                fill={statusColors[entry.status as TransferStatus] || "#94a3b8"}
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
