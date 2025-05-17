import React from "react";
import { columns } from "./columns";
import { Category } from "@prisma/client";
import DataTable from "@/components/DataTableComponents/DataTable";

import { getOrgCategories } from "@/actions/categories";
import ModalTableHeader from "@/components/dashboard/Tables/ModalTableHeader";
import { CategoryFormModal } from "@/components/Forms/inventory/CategoryFormModal";
import { getAuthenticatedUser } from "@/config/useAuth";

export default async function page() {
  const user = await getAuthenticatedUser();

  const orgId = user.orgId;
  const categories = (await getOrgCategories(orgId)) || [];
  return (
    <div className="p-p-4 md:p-8">
      <ModalTableHeader
        title="Categories"
        linkTitle="Add Category"
        href="#"
        data={categories}
        model="category"
        modalForm={<CategoryFormModal orgId={orgId} />}
      />
      <div className="py-8">
        <DataTable data={categories} columns={columns} />
      </div>
    </div>
  );
}
