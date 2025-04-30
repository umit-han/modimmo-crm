"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Check, ChevronDown, Loader2, Truck, X } from "lucide-react";
import {
  approveTransfer,
  cancelTransfer,
  completeTransfer,
} from "@/actions/stock-transfer";

type Transfer = {
  id: string;
  status: string;
  fromLocationId: string;
  toLocationId: string;
};

interface TransferActionsProps {
  transfer: Transfer;
  userId: string;
}

export function TransferActions({ transfer, userId }: TransferActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<
    "approve" | "complete" | "cancel" | null
  >(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleAction = async () => {
    if (!actionType) return;

    setIsLoading(true);

    try {
      let result;

      switch (actionType) {
        case "approve":
          result = await approveTransfer(transfer.id);
          break;
        case "complete":
          result = await completeTransfer(transfer.id);
          break;
        case "cancel":
          result = await cancelTransfer(transfer.id);
          break;
      }

      if (result.success) {
        const messages = {
          approve: "Transfer approved successfully",
          complete: "Transfer completed successfully",
          cancel: "Transfer cancelled successfully",
        };
        toast.success(messages[actionType]);
        router.refresh();
      } else {
        toast.error(result.error || "An error occurred");
      }
    } catch (error) {
      console.error(`Error ${actionType}ing transfer:`, error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
      setActionType(null);
    }
  };

  const confirmAction = (type: "approve" | "complete" | "cancel") => {
    setActionType(type);
    setShowConfirmDialog(true);
  };

  // Determine available actions based on transfer status
  const canApprove = transfer.status === "DRAFT";
  const canComplete =
    transfer.status === "APPROVED" || transfer.status === "IN_TRANSIT";
  const canCancel =
    transfer.status !== "COMPLETED" && transfer.status !== "CANCELLED";

  const getConfirmationDetails = () => {
    switch (actionType) {
      case "approve":
        return {
          title: "Approve Transfer",
          description:
            "Are you sure you want to approve this transfer? This will mark it as ready for processing.",
          confirmText: "Approve",
          confirmIcon: <Check className="mr-2 h-4 w-4" />,
        };
      case "complete":
        return {
          title: "Complete Transfer",
          description:
            "Are you sure you want to complete this transfer? This will update inventory quantities at both locations.",
          confirmText: "Complete",
          confirmIcon: <Truck className="mr-2 h-4 w-4" />,
        };
      case "cancel":
        return {
          title: "Cancel Transfer",
          description:
            "Are you sure you want to cancel this transfer? This action cannot be undone.",
          confirmText: "Cancel Transfer",
          confirmIcon: <X className="mr-2 h-4 w-4" />,
        };
      default:
        return {
          title: "",
          description: "",
          confirmText: "",
          confirmIcon: null,
        };
    }
  };

  const confirmDetails = getConfirmationDetails();

  if (!canApprove && !canComplete && !canCancel) {
    return null;
  }

  return (
    <>
      {canApprove && (
        <Button onClick={() => confirmAction("approve")} disabled={isLoading}>
          {isLoading && actionType === "approve" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Approve Transfer
        </Button>
      )}

      {canComplete && (
        <Button onClick={() => confirmAction("complete")} disabled={isLoading}>
          {isLoading && actionType === "complete" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Truck className="mr-2 h-4 w-4" />
          )}
          Complete Transfer
        </Button>
      )}

      {/* More actions dropdown */}
      {(canCancel || (canApprove && canComplete)) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isLoading}>
              More Actions
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canCancel && (
              <DropdownMenuItem
                onClick={() => confirmAction("cancel")}
                className="text-destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Transfer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDetails.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDetails.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                confirmDetails.confirmIcon
              )}
              {confirmDetails.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
