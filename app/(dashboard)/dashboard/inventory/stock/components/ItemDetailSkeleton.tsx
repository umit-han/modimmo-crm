import { Skeleton } from "@/components/ui/skeleton";

export default function ItemDetailsSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-3 gap-4 p-4 border rounded-md"
            >
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
