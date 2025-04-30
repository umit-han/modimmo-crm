// hooks/useStockAdjustmentQueries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStockAdjustments,
  approveStockAdjustment,
  cancelStockAdjustment,
  getStockAdjustmentById,
} from "@/actions/stock-adjustments";
import { toast } from "sonner";

// Type definitions
export interface AdjustmentLine {
  id: string;
  itemId: string;
  beforeQuantity: number;
  afterQuantity: number;
  adjustedQuantity: number;
  notes: string | null;
  item: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  date: Date;
  locationId: string;
  location: {
    id: string;
    name: string;
  };
  adjustmentType: string;
  reason: string;
  notes: string | null;
  status: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  approvedById: string | null;
  approvedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  lines: AdjustmentLine[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationInfo {
  total: number;
  pageCount: number;
  page: number;
  pageSize: number;
}

export interface StockAdjustmentListResponse {
  adjustments: StockAdjustment[];
  pagination: PaginationInfo;
}

// Fetch all stock adjustments with filters
export function useOrgStockAdjustments(
  orgId: string,
  options?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }
) {
  const query = useQuery({
    queryKey: ["stockAdjustments", orgId, options],
    queryFn: async () => {
      const result = await getStockAdjustments({
        orgId,
        page: options?.page || 1,
        pageSize: options?.pageSize || 10,
        search: options?.search || "",
        status: options?.status || "",
        type: options?.type || "",
        startDate: options?.startDate,
        endDate: options?.endDate,
      });
      return result;
    },
  });

  return {
    adjustments: query.data?.adjustments || [],
    pagination: query.data?.pagination || {
      total: 0,
      pageCount: 0,
      page: 1,
      pageSize: 10,
    },
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

// Fetch a specific stock adjustment by ID
export function useStockAdjustment(id: string) {
  return useQuery({
    queryKey: ["stockAdjustment", id],
    queryFn: async () => {
      const result = await getStockAdjustmentById(id);
      return result;
    },
    enabled: !!id,
  });
}

// Approve a stock adjustment
export function useApproveStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      adjustmentId,
      userId,
    }: {
      adjustmentId: string;
      userId: string;
    }) => {
      const result = await approveStockAdjustment({ adjustmentId, userId });
      if (!result.success) {
        throw new Error(result.error || "Failed to approve adjustment");
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Stock adjustment approved successfully");
      queryClient.invalidateQueries({ queryKey: ["stockAdjustments"] });
      queryClient.invalidateQueries({
        queryKey: ["stockAdjustment", variables.adjustmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error) => {
      toast.error("Failed to approve adjustment", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    },
  });
}

// Cancel a stock adjustment
export function useCancelStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adjustmentId: string) => {
      const result = await cancelStockAdjustment({ adjustmentId });
      if (!result.success) {
        throw new Error(result.error || "Failed to cancel adjustment");
      }
      return result.data;
    },
    onSuccess: (_, adjustmentId) => {
      toast.success("Stock adjustment cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["stockAdjustments"] });
      queryClient.invalidateQueries({
        queryKey: ["stockAdjustment", adjustmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error) => {
      toast.error("Failed to cancel adjustment", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    },
  });
}
