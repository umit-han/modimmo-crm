import { Suspense } from "react";

import { TableLoading } from "@/components/ui/data-table";

import CustomerListing from "./components/CustomerListing";

export default async function ProductsPage() {
  return (
    <div className="container py-8">
      <Suspense fallback={<TableLoading title="Customers" />}>
        <CustomerListing title="Customers " />
      </Suspense>
    </div>
  );
}
