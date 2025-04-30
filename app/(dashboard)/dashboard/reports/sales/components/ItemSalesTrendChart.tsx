// components/reports/sales/ItemSalesTrendChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

interface ItemData {
  item: {
    id: string;
    name: string;
    sku: string;
    sellingPrice: number;
    brand: {
      name: string;
    } | null;
    category: {
      title: string;
    } | null;
  } | null;
  quantitySold: number;
  totalRevenue: number;
  averagePrice: number;
}

interface TrendData {
  itemId: string;
  trend: Array<{
    month: string;
    itemId: string;
    quantity: number;
    revenue: number;
  }>;
}

interface ItemSalesTrendChartProps {
  salesTrends: TrendData[];
  items: ItemData[];
}

// Generate unique colors for lines
const generateColors = (count: number) => {
  const colors = [
    "#3b82f6", // blue-500
    "#ef4444", // red-500
    "#10b981", // emerald-500
    "#f97316", // orange-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f59e0b", // amber-500
    "#06b6d4", // cyan-500
    "#6366f1", // indigo-500
    "#84cc16", // lime-500
  ];

  return Array(count)
    .fill(0)
    .map((_, i) => colors[i % colors.length]);
};

export function ItemSalesTrendChart({
  salesTrends,
  items,
}: ItemSalesTrendChartProps) {
  const [displayMode, setDisplayMode] = useState<"quantity" | "revenue">(
    "revenue"
  );

  // Create item id to name mapping
  const itemMap = items.reduce(
    (acc, item) => {
      if (item.item) {
        acc[item.item.id] = item.item.name;
      }
      return acc;
    },
    {} as Record<string, string>
  );

  // Get the top 5 items by revenue for initial display
  const topItemIds = items
    .slice(0, 5)
    .map((item) => item.item?.id)
    .filter(Boolean) as string[];

  // Combine all trend data into a single dataset for the chart
  const processedData: Record<string, any> = {};

  salesTrends.forEach((trend) => {
    // Only include top items
    if (!topItemIds.includes(trend.itemId)) return;

    trend.trend.forEach((dataPoint) => {
      // Format month for display
      let displayMonth = dataPoint.month;
      if (/^\d{4}-\d{2}$/.test(dataPoint.month)) {
        const [year, month] = dataPoint.month.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        displayMonth =
          date.toLocaleString("default", { month: "short" }) + " " + year;
      }

      if (!processedData[displayMonth]) {
        processedData[displayMonth] = { month: displayMonth };
      }

      const itemName = itemMap[dataPoint.itemId] || dataPoint.itemId;
      processedData[displayMonth][`${itemName}-quantity`] = dataPoint.quantity;
      processedData[displayMonth][`${itemName}-revenue`] = dataPoint.revenue;
    });
  });

  // Convert to array and sort by month
  const chartData = Object.values(processedData).sort((a: any, b: any) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime();
  });

  // Generate colors for each item
  const colors = generateColors(topItemIds.length);

  // Custom tooltip formatter
  const formatTooltip = (value: number, name: string) => {
    if (name.endsWith("-revenue")) {
      return [
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
        name.replace("-revenue", ""),
      ];
    }
    return [value, name.replace("-quantity", "")];
  };

  return (
    <div className="h-full w-full">
      <div className="flex justify-end mb-4 space-x-2">
        <button
          className={`px-3 py-1 text-sm rounded-md ${
            displayMode === "quantity"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
          onClick={() => setDisplayMode("quantity")}
        >
          Quantity
        </button>
        <button
          className={`px-3 py-1 text-sm rounded-md ${
            displayMode === "revenue"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
          onClick={() => setDisplayMode("revenue")}
        >
          Revenue
        </button>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              displayMode === "revenue"
                ? `$${value.toLocaleString()}`
                : value.toLocaleString()
            }
          />
          <Tooltip formatter={formatTooltip} />
          <Legend />

          {topItemIds.map((itemId, index) => {
            const itemName = itemMap[itemId] || itemId;
            const dataKey = `${itemName}-${displayMode === "revenue" ? "revenue" : "quantity"}`;

            return (
              <Line
                key={itemId}
                type="monotone"
                dataKey={dataKey}
                name={itemName}
                stroke={colors[index]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
