import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function EditItemLoading() {
  return (
    <div className="container py-10 animate-pulse">
      {/* Header Section */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-muted"></div>
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-[450px] mb-2" />
            <Skeleton className="h-5 w-[300px]" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled>
              Preview
            </Button>
            <Button variant="default" disabled>
              Save All Changes
            </Button>
          </div>
        </div>

        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-muted-foreground/30 rounded-full"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full p-0 border-b rounded-none mb-6 relative">
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted"></div>
        <div className="flex">
          <div className="py-3 px-6 relative">
            <Skeleton className="h-5 w-32" />
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          </div>
          <div className="py-3 px-6">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="py-3 px-6">
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 mt-6">
        {/* Basic Details Card */}
        <div className="border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="pt-2">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Product Identifiers Card */}
        <div className="border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="pt-2">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Description Card */}
        <div className="border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="pt-2">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
