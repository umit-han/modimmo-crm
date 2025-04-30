// hooks/useProductQueries.ts
import {
  createLocation,
  deleteLocation,
  getOrgLocations,
  updateLocationById,
} from "@/actions/locations";
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
export const supplierKeys = {
  all: ["items"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: (filters: any) => [...supplierKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...supplierKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...supplierKeys.all, "detail"] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
};

export function useOrgSuppliers() {
  // Get items in a particular org
  const { data: suppliers, refetch } = useSuspenseQuery({
    queryKey: supplierKeys.lists(),
    queryFn: () => getOrgSuppliers(),
  });
  return {
    suppliers,
    refetch,
  };
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  // Create a new location
  return useMutation({
    mutationFn: (data: SupplierCreateDTO) => createSupplier(data),
    onSuccess: () => {
      toast.success("Supplier added successfully");
      // Invalidate products list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error("Failed to add Supplier", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  // Delete a product
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      toast.success("Supplier deleted successfully");
      // Invalidate products list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete supplier", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}
