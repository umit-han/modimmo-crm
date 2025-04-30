import { notFound } from "next/navigation";
import { getBriefItemById, getItemById } from "@/actions/items";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import EditItemLoading from "./edit-loading";
import { AddItemSuppliersModal } from "./add-item-supplier-modal";
import { getBriefSuppliers } from "@/actions/suppliers";
import { ItemSuppliersLayout } from "./item-supplier-layout";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const item = await getBriefItemById(id);
  const suppliers = await getBriefSuppliers();

  if (!item) {
    notFound();
  }
  const existingSupplierIds = item.supplierRelations.map((is) => is.supplierId);
  return (
    <Suspense fallback={<EditItemLoading />}>
      <div className="container ">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/inventory/items">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to items</span>
              </Button>
            </Link>
            <div className="text-sm text-muted-foreground">
              <Link
                href="/dashboard/inventory/items"
                className="hover:underline"
              >
                Items
              </Link>{" "}
              / <span>Suppliers</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
              <p className="text-muted-foreground mt-1">
                SKU: {item.sku} • Last updated:{" "}
                {new Date(item.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AddItemSuppliersModal
                existingSupplierIds={existingSupplierIds}
                suppliers={suppliers}
                itemId={id}
              />
            </div>
          </div>
        </div>

        <div className="">
          {item.supplierRelations.length > 0 ? (
            <ItemSuppliersLayout
              itemId={item.id}
              itemSuppliers={item.supplierRelations}
            />
          ) : (
            <div className="text-center p-10 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground mb-4">
                No suppliers added yet
              </p>
              {/* You could add your AddItemSuppliersModal button here */}
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}
