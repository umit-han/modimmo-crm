import { notFound } from "next/navigation";
import { SupplierUpdateForm } from "./supplier-update-form";
import { getItemById } from "@/actions/items";
import { getOrgCategories } from "@/actions/categories";
import { getOrgBrands } from "@/actions/brands";
import { getOrgTaxes } from "@/actions/tax";
import { getOrgUnits } from "@/actions/units";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import EditItemLoading from "./edit-loading";
import { getSupplierById } from "@/actions/suppliers";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const supplier = await getSupplierById(id);

  if (!supplier) {
    notFound();
  }

  return (
    <Suspense fallback={<EditItemLoading />}>
      <div className="container ">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/purchases/suppliers">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to suppliers</span>
              </Button>
            </Link>
            <div className="text-sm text-muted-foreground">
              <Link
                href="/dashboard/purchases/suppliers"
                className="hover:underline"
              >
                Suppliers
              </Link>{" "}
              / <span>Edit</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {supplier.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                Phone: {supplier.phone} • Last updated:{" "}
                {new Date(supplier.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <SupplierUpdateForm supplier={supplier} />
      </div>
    </Suspense>
  );
}
