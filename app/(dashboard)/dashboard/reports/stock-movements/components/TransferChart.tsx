// components/reports/stock-movement/TransferChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TransferChartProps {
  data: Array<{
    period: string;
    count: number;
  }>;
}

export function TransferChart({ data }: TransferChartProps) {
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
    };
  });

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="period"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            width={30}
          />
          <Tooltip
            formatter={(value: number) => [`${value} transfers`, "Transfers"]}
            labelFormatter={(label) => `Period: ${label}`}
          />
          <Bar
            dataKey="count"
            name="Transfers"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
