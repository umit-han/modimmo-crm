import { Badge } from "@/components/ui/badge";

export default function TransferStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "DRAFT":
      return <Badge variant="outline">Draft</Badge>;
    case "APPROVED":
      return <Badge className="bg-blue-500">Approved</Badge>;
    case "IN_TRANSIT":
      return <Badge className="bg-orange-500">In Transit</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-500">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
