import { Skeleton } from "@/components/ui/skeleton";

export default function ItemListSkeleton() {
  return (
    <div className="space-y-2 border rounded-lg p-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center space-x-2 py-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
