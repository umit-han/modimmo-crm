// components/reports/sales/CustomerSalesChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CustomerSalesChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export function CustomerSalesChart({ data }: CustomerSalesChartProps) {
  // Sort data by value (highest to lowest)
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Truncate long customer names for display
  const formattedData = sortedData.map((item) => ({
    ...item,
    displayName:
      item.name.length > 20 ? item.name.substring(0, 17) + "..." : item.name,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <YAxis
            dataKey="displayName"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            width={80}
          />
          <Tooltip
            formatter={(value: number) => [
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(value),
              "Revenue",
            ]}
            labelFormatter={(label) =>
              `Customer: ${formattedData.find((item) => item.displayName === label)?.name}`
            }
          />
          <Bar
            dataKey="value"
            name="Revenue"
            fill="#4ade80"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
