import { Badge } from "@/components/ui/badge";

export default function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return <Badge className="bg-green-500">Completed</Badge>;
    case "PENDING":
      return (
        <Badge variant="outline" className="text-orange-500 border-orange-500">
          Pending
        </Badge>
      );
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
