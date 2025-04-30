// components/reports/sales/SalesReport.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid } from "@/components/ui/grid";
import { SalesOrderStatus, PaymentStatus } from "@prisma/client";
import { CustomerSalesChart } from "./CustomerSalesChart";
import { TopCustomersTable } from "./TopCustomersTable";
import { RecentOrdersTable } from "./RecentOrdersTable";
import { TopItemsTable } from "./TopItemsTable";
import { ItemSalesTrendChart } from "./ItemSalesTrendChart";
import { SalesSummaryCards } from "./SummaryCards";
import { SalesTrendChart } from "./SalesTrendChart";
import { OrderStatusChart } from "./OrderStatusChart";
import { PaymentStatusChart } from "./PaymentStatusChart";

interface SalesReportProps {
  data: {
    summaryStats: {
      totalSalesRevenue: number;
      totalOrders: number;
      totalItemsSold: number;
      orderCounts: Array<{
        status: SalesOrderStatus;
        _count: { id: number };
      }>;
      paymentStatusDistribution: Array<{
        paymentStatus: PaymentStatus;
        _count: { id: number };
        _sum: { total: number | null };
      }>;
      salesTrend: Array<{
        period: string;
        count: number;
        total: number;
      }>;
    };
    customerData: {
      customers: Array<{
        customer: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
        };
        orderCount: number;
        totalSpent: number;
      } | null>;
      recentOrders: Array<{
        id: string;
        orderNumber: string;
        date: Date;
        total: number;
        status: SalesOrderStatus;
        paymentStatus: PaymentStatus;
        customer: {
          id: string;
          name: string;
        } | null;
      }>;
    };
    itemData: {
      items: Array<{
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
      }>;
      salesTrends: Array<{
        itemId: string;
        trend: Array<{
          month: string;
          itemId: string;
          quantity: number;
          revenue: number;
        }>;
      }>;
    };
  };
  view: "summary" | "customers" | "items";
}

export default function SalesReport({ data, view }: SalesReportProps) {
  const { summaryStats, customerData, itemData } = data;

  // Get top 5 customers for the summary view
  const topCustomers = customerData.customers.filter(Boolean).slice(0, 5);

  // Get top 5 items for the summary view
  const topItems = itemData.items.slice(0, 5);

  // Format customer data for the chart
  const customerChartData = customerData.customers
    .filter(Boolean)
    .map((customer) => ({
      name: customer?.customer.name || "Unknown",
      value: customer?.totalSpent || 0,
    }))
    .slice(0, 10);

  // Render different views based on the selected tab
  if (view === "customers") {
    return (
      <>
        <Grid columns={2} gap={6} className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerSalesChart data={customerChartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Order Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <TopCustomersTable
                customers={customerData.customers.filter(Boolean)}
              />
            </CardContent>
          </Card>
        </Grid>

        <Card>
          <CardHeader>
            <CardTitle>Recent Customer Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable orders={customerData.recentOrders} />
          </CardContent>
        </Card>
      </>
    );
  }

  if (view === "items") {
    return (
      <>
        <Grid columns={1} gap={6} className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <TopItemsTable items={itemData.items} />
            </CardContent>
          </Card>
        </Grid>

        <Card>
          <CardHeader>
            <CardTitle>Item Sales Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            <ItemSalesTrendChart
              salesTrends={itemData.salesTrends}
              items={itemData.items}
            />
          </CardContent>
        </Card>
      </>
    );
  }

  // Default summary view
  return (
    <>
      <SalesSummaryCards stats={summaryStats} />

      <Grid columns={2} gap={6}>
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <SalesTrendChart data={summaryStats.salesTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2">
                Order Status Distribution
              </h4>
              <OrderStatusChart data={summaryStats.orderCounts} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">
                Payment Status Distribution
              </h4>
              <PaymentStatusChart
                data={summaryStats.paymentStatusDistribution}
              />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid columns={1} gap={6}>
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <TopCustomersTable customers={topCustomers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <TopItemsTable items={topItems} />
          </CardContent>
        </Card>
      </Grid>
    </>
  );
}
