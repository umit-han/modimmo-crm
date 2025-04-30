// components/reports/sales/SalesTrendChart.tsx
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SalesTrendChartProps {
  data: Array<{
    period: string;
    count: number;
    total: number;
  }>;
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  // Format period labels for better readability
  const formattedData = data.map((item) => {
    let formattedPeriod = item.period;

    // If it's a monthly format (YYYY-MM), make it more readable
    if (/^\d{4}-\d{2}$/.test(item.period)) {
      const [year, month] = item.period.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      formattedPeriod =
        date.toLocaleString("default", { month: "short" }) + " " + year;
    }

    return {
      ...item,
      period: formattedPeriod,
      formattedTotal: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(item.total),
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="period"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          yAxisId="left"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          width={80}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          width={40}
        />
        <Tooltip
          formatter={(value: any, name: string) => {
            if (name === "Revenue") {
              return [
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(value),
                name,
              ];
            }
            return [value, name];
          }}
          labelFormatter={(label) => `Period: ${label}`}
        />
        <Legend />
        <Bar
          yAxisId="right"
          dataKey="count"
          name="Orders"
          fill="#8884d8"
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="total"
          name="Revenue"
          stroke="#ff7300"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
