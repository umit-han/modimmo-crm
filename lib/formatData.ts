import { format as dateFnsFormat } from "date-fns";
export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return dateFnsFormat(new Date(date), "MMM d, yyyy");
}

export function formatCurrency(amount: number | null): string {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
