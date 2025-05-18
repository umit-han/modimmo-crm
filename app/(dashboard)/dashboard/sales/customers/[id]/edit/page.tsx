import { notFound } from "next/navigation";
import { CustomerUpdateForm } from "./customer-update-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import EditItemLoading from "./edit-loading";
import { getCustomerById } from "@/actions/customers";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <Suspense fallback={<EditItemLoading />}>
      <div className="sm:container ">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/sales/customers">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Suppliers</span>
              </Button>
            </Link>
            <div className="text-sm text-muted-foreground">
              <Link
                href="/dashboard/sales/customers"
                className="hover:underline"
              >
                Customers
              </Link>{" "}
              / <span>Edit</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                {customer.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                Phone: {customer.phone} • Last updated:{" "}
                {new Date(customer.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <CustomerUpdateForm customer={customer} />
      </div>
    </Suspense>
  );
}
