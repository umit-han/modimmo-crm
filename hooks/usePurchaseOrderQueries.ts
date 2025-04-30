// hooks/useProductQueries.ts
import {
  createLocation,
  deleteLocation,
  getOrgLocations,
  updateLocationById,
} from "@/actions/locations";
import { getPurchaseOrderLineItems } from "@/actions/purchase-orders";
import {
  createSupplier,
  deleteSupplier,
  getOrgSuppliers,
} from "@/actions/suppliers";
import { itemAPI } from "@/services/items";
import { ItemCreateDTO } from "@/types/item";
import { LocationCreateDTO, LocationDTO } from "@/types/location";
import { SupplierCreateDTO } from "@/types/types";
import {
  useQuery,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

// Query keys for caching
export const purchaseOrderKeys = {
  all: ["items"] as const,
  lists: () => [...purchaseOrderKeys.all, "list"] as const,
  list: (filters: any) => [...purchaseOrderKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...purchaseOrderKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...purchaseOrderKeys.all, "detail"] as const,
  detail: (id: string) => [...purchaseOrderKeys.details(), id] as const,
};

export function usePurchaseOrderItems(purchaseOrderId: string) {
  // Get items in a particular pO
  const {
    data: lines,
    refetch,
    isPending,
  } = useQuery({
    queryKey: purchaseOrderKeys.detail(purchaseOrderId),
    queryFn: () => getPurchaseOrderLineItems(purchaseOrderId),
  });
  return {
    lines,
    refetch,
    isLoading: isPending,
  };
}
