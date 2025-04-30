// components/reports/sales/PaymentStatusChart.tsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PaymentStatus } from "@prisma/client";

interface PaymentStatusChartProps {
  data: Array<{
    paymentStatus: PaymentStatus;
    _count: { id: number };
    _sum: { total: number | null };
  }>;
}

// Map payment status to human-readable labels
const statusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PARTIAL: "Partial",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

// Define colors for each payment status
const statusColors: Record<PaymentStatus, string> = {
  PENDING: "#f97316", // orange-500
  PARTIAL: "#facc15", // yellow-400
  PAID: "#22c55e", // green-500
  REFUNDED: "#94a3b8", // slate-400
};

export function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    name: statusLabels[item.paymentStatus] || item.paymentStatus,
    value: item._count.id,
    amount: item._sum.total || 0,
    status: item.paymentStatus,
  }));

  // Sort data by payment status order for consistency
  const statusOrder = [
    PaymentStatus.PAID,
    PaymentStatus.PARTIAL,
    PaymentStatus.PENDING,
    PaymentStatus.REFUNDED,
  ];

  chartData.sort(
    (a, b) =>
      statusOrder.indexOf(a.status as PaymentStatus) -
      statusOrder.indexOf(b.status as PaymentStatus)
  );

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(payload[0].payload.amount);

      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">
            {payload[0].name}: {payload[0].value} orders
          </p>
          <p className="text-gray-500">Total: {formattedAmount}</p>
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
                fill={statusColors[entry.status as PaymentStatus] || "#94a3b8"}
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
