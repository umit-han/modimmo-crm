// components/reports/sales/OrderStatusChart.tsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SalesOrderStatus } from "@/types/enums";

interface OrderStatusChartProps {
  data: Array<{
    status: SalesOrderStatus;
    _count: { id: number };
  }>;
}

// Map status to human-readable labels
const statusLabels: Record<SalesOrderStatus, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

// Define colors for each status
const statusColors: Record<SalesOrderStatus, string> = {
  DRAFT: "#94a3b8", // slate-400
  CONFIRMED: "#60a5fa", // blue-400
  PROCESSING: "#a855f7", // purple-400
  SHIPPED: "#fb923c", // orange-400
  DELIVERED: "#facc15", // yellow-400
  COMPLETED: "#22c55e", // green-500
  CANCELLED: "#f87171", // red-400
  RETURNED: "#f43f5e", // rose-500
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    name: statusLabels[item.status] || item.status,
    value: item._count.id,
    status: item.status,
  }));

  // Sort data by status order for consistency
  const statusOrder = [
    SalesOrderStatus.DRAFT,
    SalesOrderStatus.CONFIRMED,
    SalesOrderStatus.PROCESSING,
    SalesOrderStatus.SHIPPED,
    SalesOrderStatus.DELIVERED,
    SalesOrderStatus.COMPLETED,
    SalesOrderStatus.CANCELLED,
    SalesOrderStatus.RETURNED,
  ];

  chartData.sort(
    (a, b) =>
      statusOrder.indexOf(a.status as SalesOrderStatus) -
      statusOrder.indexOf(b.status as SalesOrderStatus)
  );

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">
            {payload[0].name}: {payload[0].value} orders
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[160px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
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
                fill={
                  statusColors[entry.status as SalesOrderStatus] || "#94a3b8"
                }
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
