"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarIcon, FilterIcon, XCircle } from "lucide-react";
import { format, subDays, startOfYear } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { SelectRangeEventHandler } from "react-day-picker";

// Define types for our filters
type DateRange = {
  label: string;
  value: string;
  getStartDate?: () => Date;
};

type OrderStatus = {
  label: string;
  value: string;
  badgeVariant: "default" | "outline" | "secondary" | "destructive" | "success";
};

// Date range options
const dateRanges: DateRange[] = [
  {
    label: "All time",
    value: "all",
  },
  {
    label: "Today",
    value: "today",
    getStartDate: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day
      return today;
    },
  },
  {
    label: "Last 7 days",
    value: "7days",
    getStartDate: () => subDays(new Date(), 7),
  },
  {
    label: "Last 30 days",
    value: "30days",
    getStartDate: () => subDays(new Date(), 30),
  },
  {
    label: "Last 90 days",
    value: "90days",
    getStartDate: () => subDays(new Date(), 90),
  },
  {
    label: "This year",
    value: "thisyear",
    getStartDate: () => startOfYear(new Date()),
  },
  {
    label: "Custom",
    value: "custom",
  },
];

// Order status options
const orderStatuses: OrderStatus[] = [
  {
    label: "All statuses",
    value: "all",
    badgeVariant: "outline",
  },
  {
    label: "Draft",
    value: "DRAFT",
    badgeVariant: "outline",
  },
  {
    label: "Confirmed",
    value: "CONFIRMED",
    badgeVariant: "secondary",
  },
  {
    label: "Processing",
    value: "PROCESSING",
    badgeVariant: "secondary",
  },
  {
    label: "Shipped",
    value: "SHIPPED",
    badgeVariant: "secondary",
  },
  {
    label: "Delivered",
    value: "DELIVERED",
    badgeVariant: "success",
  },
  {
    label: "Completed",
    value: "COMPLETED",
    badgeVariant: "success",
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
    badgeVariant: "destructive",
  },
  {
    label: "Returned",
    value: "RETURNED",
    badgeVariant: "destructive",
  },
];

// Payment status options
const paymentStatuses = [
  {
    label: "All payment statuses",
    value: "all",
    badgeVariant: "outline",
  },
  {
    label: "Pending",
    value: "PENDING",
    badgeVariant: "outline",
  },
  {
    label: "Partial",
    value: "PARTIAL",
    badgeVariant: "secondary",
  },
  {
    label: "Paid",
    value: "PAID",
    badgeVariant: "success",
  },
  {
    label: "Refunded",
    value: "REFUNDED",
    badgeVariant: "destructive",
  },
];
type Range = {
  from: Date | undefined;
  to: Date | undefined;
};
type Variant =
  | "default"
  | "outline"
  | "secondary"
  | "destructive"
  | "success"
  | "warning"
  | "info"
  | null
  | undefined;
export function SalesOrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current filter values from URL or set defaults
  const currentDateRange = searchParams.get("dateRange") || "all";
  const currentStatus = searchParams.get("status") || "all";
  const currentPaymentStatus = searchParams.get("paymentStatus") || "all";
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";

  // State for custom date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    dateRanges.find((range) => range.value === currentDateRange)
  );
  const [customDateRange, setCustomDateRange] = useState<Range>({
    from: fromDate ? new Date(fromDate) : undefined,
    to: toDate ? new Date(toDate) : undefined,
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentDateRange !== "all") count++;
    if (currentStatus !== "all") count++;
    if (currentPaymentStatus !== "all") count++;
    return count;
  };

  // Create URL with updated search params
  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([name, value]) => {
        if (value === null) {
          newSearchParams.delete(name);
        } else {
          newSearchParams.set(name, value);
        }
      });

      return newSearchParams.toString();
    },
    [searchParams]
  );

  // Apply filters
  const applyFilters = (params: Record<string, string | null>) => {
    router.push(`${pathname}?${createQueryString(params)}`);
  };

  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    const newParams: Record<string, string | null> = {
      dateRange: value,
      fromDate: null,
      toDate: null,
    };

    // If custom date range, keep existing dates
    if (value === "custom") {
      if (customDateRange.from) {
        newParams.fromDate = format(customDateRange.from, "yyyy-MM-dd");
      }
      if (customDateRange.to) {
        newParams.toDate = format(customDateRange.to, "yyyy-MM-dd");
      }
      setCalendarOpen(true);
    } else if (value === "today") {
      // For "today", set both from and to date to today
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of day
      newParams.fromDate = format(today, "yyyy-MM-dd");
      newParams.toDate = format(today, "yyyy-MM-dd");
    } else {
      const selectedRange = dateRanges.find((range) => range.value === value);
      if (selectedRange?.getStartDate) {
        const startDate = selectedRange.getStartDate();
        newParams.fromDate = format(startDate, "yyyy-MM-dd");
        newParams.toDate = format(new Date(), "yyyy-MM-dd");
      }
    }

    applyFilters(newParams);
  };

  // Handle calendar date selection
  const handleCalendarSelect = (range: Range) => {
    setCustomDateRange(range);

    if (range.from && range.to) {
      applyFilters({
        dateRange: "custom",
        fromDate: format(range.from, "yyyy-MM-dd"),
        toDate: format(range.to, "yyyy-MM-dd"),
      });
      setTimeout(() => setCalendarOpen(false), 300);
    }
  };

  // Handle order status change
  const handleStatusChange = (value: string) => {
    applyFilters({ status: value });
  };

  // Handle payment status change
  const handlePaymentStatusChange = (value: string) => {
    applyFilters({ paymentStatus: value });
  };

  // Reset all filters
  const resetFilters = () => {
    router.push(pathname);
  };

  // Format the date display for custom range
  const formatDateDisplay = () => {
    if (currentDateRange === "custom" && fromDate && toDate) {
      return `${format(new Date(fromDate), "MMM d, yyyy")} - ${format(
        new Date(toDate),
        "MMM d, yyyy"
      )}`;
    }

    const selectedRange = dateRanges.find(
      (range) => range.value === currentDateRange
    );
    return selectedRange?.label || "All time";
  };

  // Update date range state when URL params change
  useEffect(() => {
    setDateRange(dateRanges.find((range) => range.value === currentDateRange));

    if (fromDate && toDate) {
      setCustomDateRange({
        from: new Date(fromDate),
        to: new Date(toDate),
      });
    }
  }, [currentDateRange, fromDate, toDate]);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range Filter */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>{formatDateDisplay()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto" align="start">
            <div className="p-3 border-b">
              <div className="space-y-2">
                <h4 className="font-medium">Date Range</h4>
                <Select
                  value={currentDateRange}
                  onValueChange={handleDateRangeChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {currentDateRange === "custom" && (
              <Calendar
                mode="range"
                selected={{
                  from: customDateRange.from,
                  to: customDateRange.to,
                }}
                onSelect={handleCalendarSelect as SelectRangeEventHandler}
                initialFocus
                numberOfMonths={2}
                className="rounded-md border"
              />
            )}
          </PopoverContent>
        </Popover>

        {/* Order Status Filter */}
        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {orderStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.value !== "all" ? (
                  <div className="flex items-center">
                    <Badge
                      variant={status.badgeVariant}
                      className="mr-2 px-1 text-xs"
                    >
                      &nbsp;
                    </Badge>
                    {status.label}
                  </div>
                ) : (
                  status.label
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment Status Filter */}
        <Select
          value={currentPaymentStatus}
          onValueChange={handlePaymentStatusChange}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select payment status" />
          </SelectTrigger>
          <SelectContent>
            {paymentStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.value !== "all" ? (
                  <div className="flex items-center">
                    <Badge
                      variant={status.badgeVariant as Variant}
                      className="mr-2 px-1 text-xs"
                    >
                      &nbsp;
                    </Badge>
                    {status.label}
                  </div>
                ) : (
                  status.label
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Filters */}
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-10"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reset filters
            <Badge variant="secondary" className="ml-2">
              {getActiveFiltersCount()}
            </Badge>
          </Button>
        )}
      </div>
    </div>
  );
}
