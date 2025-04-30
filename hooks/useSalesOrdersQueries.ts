// hooks/useSalesOrderQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSalesOrderById,
  updateSalesOrderStatus,
  updatePaymentStatus,
} from "@/actions/sales-orders";

/**
 * Hook to fetch sales order items
 */
export function useSalesOrderItems(salesOrderId: string) {
  return useQuery({
    queryKey: ["salesOrderItems", salesOrderId],
    queryFn: async () => {
      if (!salesOrderId) return { lines: [] };

      const salesOrder = await getSalesOrderById(salesOrderId);
      if (!salesOrder) return { lines: [] };

      return { lines: salesOrder.lines || [] };
    },
    enabled: !!salesOrderId,
  });
}

/**
 * Hook to fetch a single sales order
 */
export function useSalesOrder(orderId: string) {
  return useQuery({
    queryKey: ["salesOrder", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      return await getSalesOrderById(orderId);
    },
    enabled: !!orderId,
  });
}

/**
 * Hook to update sales order status
 */
export function useUpdateSalesOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      const result = await updateSalesOrderStatus(orderId, status);
      if (!result.success) {
        throw new Error(result.error || "Failed to update order status");
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Order status updated to ${variables.status}`);
      queryClient.invalidateQueries({
        queryKey: ["salesOrder", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update order status"
      );
    },
  });
}

/**
 * Hook to update payment status
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      paymentStatus,
    }: {
      orderId: string;
      paymentStatus: string;
    }) => {
      const result = await updatePaymentStatus(orderId, paymentStatus);
      if (!result.success) {
        throw new Error(result.error || "Failed to update payment status");
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Payment status updated to ${variables.paymentStatus}`);
      queryClient.invalidateQueries({
        queryKey: ["salesOrder", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["salesOrders"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update payment status"
      );
    },
  });
}
