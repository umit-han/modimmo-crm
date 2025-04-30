"use client";

import {
  Box,
  TrendingDown,
  ShoppingBag,
  PackageCheck,
  ShoppingCart,
  FileText,
  ChevronRight,
  Eye,
  Printer,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

// Define the props interface for the dashboard data
interface InventoryMetricsDisplayProps {
  data: {
    inventoryValue: number;
    totalItems: number;
    lowStockItems: any[];
    topSellingItems: any[];
    salesOrders: {
      count: number;
      value: number;
    };
    purchaseOrders: {
      count: number;
      value: number;
    };
    recentCustomers: any[];
    recentSalesOrders: any[];
  };
}

export default function InventoryMetricsDisplay({
  data,
}: InventoryMetricsDisplayProps) {
  const bigCards = [
    {
      title: "Inventory Value",
      value: data.inventoryValue,
      isCurrency: true,
      change: "+12.3%",
      trend: "up",
      icon: Box,
    },
    {
      title: "Total Items",
      value: data.totalItems,
      isCurrency: false,
      change: "+20.1%",
      trend: "up",
      icon: ShoppingBag,
    },
    {
      title: "Total Sales Orders",
      value: data.salesOrders.value,
      count: data.salesOrders.count,
      change: "+8.3%",
      isCurrency: true,
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Total Purchase Orders",
      value: data.purchaseOrders.value,
      count: data.purchaseOrders.count,
      isCurrency: true,
      change: "+15.2%",
      trend: "up",
      icon: ShoppingBag,
    },
  ];
  return (
    <div className="space-y-6">
      {/* Key metrics from the data */}

      <div className="grid grid-cols-12 gap-6">
        {/* Big Cards - 4 cards in a row */}
        {bigCards.map((card, index) => (
          <Card key={index} className="col-span-3 relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.isCurrency ? formatCurrency(card.value) : card.value}
              </div>
              <div
                className={`flex items-center text-sm ${card.trend === "up" ? "text-green-600" : "text-red-600"}`}
              >
                View details
                <ArrowRight className="mr-1 h-4 w-4" />
              </div>
            </CardContent>
            <div className="absolute right-0 bottom-0 opacity-5">
              <card.icon className="h-24 w-24 text-primary" />
            </div>
          </Card>
        ))}
      </div>

      {/* Top Tables - Low Stock Alerts and Top Selling Products */}
      <div className="grid grid-cols-12 gap-6">
        {/* Low Stock Alerts */}
        <Card className="col-span-7">
          <CardHeader className="">
            <div className="flex justify-between items-center">
              <CardTitle>Low Stock Alerts</CardTitle>
              <Button asChild variant="ghost" className="">
                <Link href="#" className="text-blue-600">
                  <span className="">View details</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Current Qty</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lowStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.item.name}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.item.minStockLevel}</TableCell>
                    <TableCell>{item.location.name}</TableCell>
                  </TableRow>
                ))}
                {data.lowStockItems.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No low stock items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="col-span-5">
          <CardHeader className="">
            <div className="flex justify-between items-center">
              <CardTitle>Top Selling Products</CardTitle>
              <Button asChild variant="ghost" className="">
                <Link href="#" className="text-blue-600">
                  <span className="">View details</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Sales Count</TableHead>
                  <TableHead>Sales Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topSellingItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.salesCount}</TableCell>
                    <TableCell>{formatCurrency(item.salesTotal)}</TableCell>
                  </TableRow>
                ))}
                {data.topSellingItems.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No sales data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Tables - Recent Customers and Recent Sales Orders */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Sales Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentSalesOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      {new Date(order.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {order.customer?.name || "Direct Sale"}
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" title="View Order">
                          <Link href={`/dashboard/sales/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View Invoice"
                          asChild
                        >
                          <Link
                            href={`/dashboard/sales/orders/${order.id}/invoice`}
                          >
                            <Printer className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {data.recentSalesOrders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No recent sales orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
