import DataTable from "@/components/DataTableComponents/DataTable";
import { columns } from "./columns";

import ModalTableHeader from "@/components/dashboard/Tables/ModalTableHeader";
import { getAuthenticatedUser } from "@/config/useAuth";
import { UnitForm } from "@/components/Forms/inventory/UnitForm";
import { getOrgUnits } from "@/actions/units";
import { BrandForm } from "@/components/Forms/inventory/BrandForm";
import { getOrgBrands } from "@/actions/brands";
import { Suspense } from "react";
import { TableLoading } from "@/components/ui/data-table";
export default async function page() {
  const user = await getAuthenticatedUser();

  const orgId = user.orgId;
  const orgName = user?.orgName ?? "";
  const brands = (await getOrgBrands(orgId)) || [];

  return (
    <div className="p-8">
      <Suspense fallback={<TableLoading title="Vehicle Inventory" />}>
        <ModalTableHeader
          title="Brands"
          linkTitle="Add Brand"
          href="#"
          data={brands}
          model="brand"
          modalForm={<BrandForm orgId={orgId} />}
        />
        <DataTable columns={columns} data={brands} />
      </Suspense>
    </div>
  );
}
