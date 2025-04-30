import { Skeleton } from "@/components/ui/skeleton";

export default function GoodsReceiptListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex justify-between items-center mt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
