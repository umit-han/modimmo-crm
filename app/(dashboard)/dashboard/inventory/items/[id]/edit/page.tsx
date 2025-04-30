import { notFound } from "next/navigation";
import { ItemUpdateForm } from "./item-update-form";
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

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const { data: item, success, error } = await getItemById(id);

  if (!item) {
    notFound();
  }
  const taxes = await getOrgTaxes(item.orgId);
  const units = await getOrgUnits(item.orgId);
  const categories = await getOrgCategories(item.orgId);
  const brands = await getOrgBrands(item.orgId);
  const brandOptions = brands.map((item) => {
    return {
      label: item.name,
      value: item.id,
    };
  });
  const categoryOptions = categories.map((item) => {
    return {
      label: item.title,
      value: item.id,
    };
  });
  const taxOptions = taxes.map((item) => {
    return {
      label: `${item.name}-${item.rate}`,
      value: item.id,
    };
  });
  const unitOptions = units.map((item) => {
    return {
      label: `${item.name}-${item.symbol}`,
      value: item.id,
    };
  });
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
              / <span>Edit</span>
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
              <Button variant="outline">Preview</Button>
              {/* <Button variant="default">Save All Changes</Button> */}
            </div>
          </div>

          {/* <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-primary rounded-full"></div>
        </div> */}
        </div>

        <ItemUpdateForm
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
          unitOptions={unitOptions}
          taxOptions={taxOptions}
          item={item}
        />
      </div>
    </Suspense>
  );
}
