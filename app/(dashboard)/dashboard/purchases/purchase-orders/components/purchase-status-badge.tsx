import type { PurchaseOrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PurchaseOrderStatusBadgeProps {
  status: PurchaseOrderStatus;
}

export function PurchaseOrderStatusBadge({
  status,
}: PurchaseOrderStatusBadgeProps) {
  const getStatusConfig = (status: PurchaseOrderStatus) => {
    switch (status) {
      case "DRAFT":
        return { label: "Draft", className: "bg-muted text-muted-foreground" };
      case "SUBMITTED":
        return { label: "Submitted", className: "bg-blue-100 text-blue-800" };
      case "APPROVED":
        return { label: "Approved", className: "bg-green-100 text-green-800" };
      case "PARTIALLY_RECEIVED":
        return {
          label: "Partially Received",
          className: "bg-amber-100 text-amber-800",
        };
      case "RECEIVED":
        return {
          label: "Received",
          className: "bg-emerald-100 text-emerald-800",
        };
      case "CANCELLED":
        return { label: "Cancelled", className: "bg-red-100 text-red-800" };
      case "CLOSED":
        return { label: "Closed", className: "bg-gray-100 text-gray-800" };
      default:
        return { label: status, className: "bg-muted text-muted-foreground" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={cn("font-normal", config.className)}>
      {config.label}
    </Badge>
  );
}
