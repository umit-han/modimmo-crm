// components/reports/DateRangeFilter.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
});

type DateRangeFormValues = z.infer<typeof formSchema>;

interface DateRangePickerFormProps {
  initialFromDate?: Date;
  initialToDate?: Date;
  initialPeriod?: string;
}

export function DateRangePickerForm({
  initialFromDate,
  initialToDate,
  initialPeriod = "monthly",
}: DateRangePickerFormProps) {
  const router = useRouter();

  // Initialize form with default values
  const form = useForm<DateRangeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      period: initialPeriod as "daily" | "weekly" | "monthly",
      fromDate: initialFromDate,
      toDate: initialToDate,
    },
  });

  const onSubmit = (data: DateRangeFormValues) => {
    // Build query parameters
    const params = new URLSearchParams();

    if (data.period) {
      params.set("period", data.period);
    }

    if (data.fromDate) {
      params.set("fromDate", format(data.fromDate, "yyyy-MM-dd"));
    }

    if (data.toDate) {
      params.set("toDate", format(data.toDate, "yyyy-MM-dd"));
    }

    // Update URL with new query parameters
    router.push(`?${params.toString()}`);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex space-x-4 items-end"
      >
        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem className="w-32">
              <FormLabel>Period</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fromDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>From</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[180px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      const toDate = form.watch("toDate");
                      return (
                        date > new Date() || (toDate ? date > toDate : false)
                      );
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="toDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>To</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[180px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      const fromDate = form.watch("fromDate");
                      return (
                        date > new Date() ||
                        (fromDate ? date > fromDate : false)
                      );
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        <Button type="submit">Apply</Button>
      </form>
    </Form>
  );
}
