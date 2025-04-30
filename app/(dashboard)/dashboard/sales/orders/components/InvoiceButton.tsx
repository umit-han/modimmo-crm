"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvoiceButtonProps {
  orderId: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function InvoiceButton({
  orderId,
  variant = "outline",
  size = "sm",
  className = "",
}: InvoiceButtonProps) {
  return (
    <Button variant={variant} size={size} className={className} asChild>
      <Link href={`/dashboard/sales/orders/${orderId}/invoice`}>
        <FileText className="h-4 w-4 mr-2" />
        View Invoice
      </Link>
    </Button>
  );
}
