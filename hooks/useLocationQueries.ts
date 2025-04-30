// hooks/useProductQueries.ts
import {
  createLocation,
  deleteLocation,
  getOrgLocations,
  updateLocationById,
} from "@/actions/locations";
import { itemAPI } from "@/services/items";
import { ItemCreateDTO } from "@/types/item";
import { LocationCreateDTO, LocationDTO } from "@/types/location";
import {
  useQuery,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

// Query keys for caching
export const locationKeys = {
  all: ["items"] as const,
  lists: () => [...locationKeys.all, "list"] as const,
  list: (filters: any) => [...locationKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...locationKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...locationKeys.all, "detail"] as const,
  detail: (id: string) => [...locationKeys.details(), id] as const,
};

export function useOrgLocations() {
  // Get items in a particular org
  const { data: locations, refetch } = useSuspenseQuery({
    queryKey: locationKeys.lists(),
    queryFn: () => getOrgLocations(),
  });
  return {
    locations,
    refetch,
  };
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  // Create a new location
  return useMutation({
    mutationFn: (data: LocationCreateDTO) => createLocation(data),
    onSuccess: () => {
      toast.success("Location added successfully");
      // Invalidate products list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error("Failed to add Location", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  // Update an existing product
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LocationDTO> }) =>
      updateLocationById(id, data),
    onSuccess: (data, variables) => {
      toast.success("Location updated successfully");
      // Invalidate specific product detail and list queries
      queryClient.invalidateQueries({
        queryKey: locationKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error("Failed to update location", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  // Delete a product
  return useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => {
      toast.success("Location deleted successfully");
      // Invalidate products list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete location", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}
