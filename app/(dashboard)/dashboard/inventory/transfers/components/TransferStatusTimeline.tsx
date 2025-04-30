import { formatDate } from "@/lib/utils";
import { Check, Clock, Truck, X } from "lucide-react";

interface TransferStatusTimelineProps {
  status: string;
  createdAt: Date;
  approvedAt?: Date | null;
  inTransitAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
}

export function TransferStatusTimeline({
  status,
  createdAt,
  approvedAt,
  inTransitAt,
  completedAt,
  cancelledAt,
}: TransferStatusTimelineProps) {
  // Define the timeline steps based on the current status
  const steps = [
    {
      name: "Created",
      description: "Transfer created",
      icon: <Clock className="h-5 w-5" />,
      date: createdAt,
      status: "complete", // Always complete
    },
    {
      name: "Approved",
      description: "Transfer approved",
      icon: <Check className="h-5 w-5" />,
      date: approvedAt,
      status:
        status === "CANCELLED" && !approvedAt
          ? "cancelled"
          : approvedAt
            ? "complete"
            : status === "DRAFT"
              ? "current"
              : "upcoming",
    },
    {
      name: "In Transit",
      description: "Items in transit",
      icon: <Truck className="h-5 w-5" />,
      date: inTransitAt,
      status:
        status === "CANCELLED" && !inTransitAt
          ? "cancelled"
          : inTransitAt
            ? "complete"
            : status === "APPROVED"
              ? "current"
              : status === "DRAFT"
                ? "upcoming"
                : "upcoming",
    },
    {
      name: "Completed",
      description: "Transfer completed",
      icon: <Check className="h-5 w-5" />,
      date: completedAt,
      status:
        status === "CANCELLED" && !completedAt
          ? "cancelled"
          : completedAt
            ? "complete"
            : status === "IN_TRANSIT"
              ? "current"
              : "upcoming",
    },
  ];

  // If cancelled, add a cancelled step
  if (status === "CANCELLED") {
    steps.push({
      name: "Cancelled",
      description: "Transfer cancelled",
      icon: <X className="h-5 w-5" />,
      date: cancelledAt,
      status: "complete",
    });
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {steps.map((step, stepIdx) => (
          <li key={step.name}>
            <div className="relative pb-8">
              {stepIdx !== steps.length - 1 ? (
                <span
                  className={`absolute left-4 top-4 -ml-px h-full w-0.5 ${
                    step.status === "complete"
                      ? "bg-primary"
                      : step.status === "current"
                        ? "bg-primary"
                        : step.status === "cancelled"
                          ? "bg-destructive"
                          : "bg-muted"
                  }`}
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-1 ring-inset ${
                      step.status === "complete"
                        ? "bg-primary text-primary-foreground ring-primary"
                        : step.status === "current"
                          ? "bg-primary/20 text-primary ring-primary"
                          : step.status === "cancelled"
                            ? "bg-destructive text-destructive-foreground ring-destructive"
                            : "bg-muted text-muted-foreground ring-muted"
                    }`}
                  >
                    {step.icon}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        step.status === "complete" || step.status === "current"
                          ? "text-foreground"
                          : step.status === "cancelled"
                            ? "text-destructive"
                            : "text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-muted-foreground">
                    {step.date ? formatDate(step.date) : ""}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
