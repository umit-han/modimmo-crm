"use client";

import { ColumnDef } from "@tanstack/react-table";

import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { BrandDTO, UnitDTO, UserWithRoles } from "@/types/types";
import UserRoleBtn from "@/components/DataTableColumns/UserRoleBtn";

export const columns: ColumnDef<BrandDTO>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
  },
  {
    accessorKey: "slug",
    header: ({ column }) => <SortableColumn column={column} title="Slug" />,
  },
  // {
  //   accessorKey: "role",
  //   header: "Role",
  //   cell: ({ row }) => {
  //     const user = row.original;
  //     const role = user.role.displayName;
  //     return <h2>{role}</h2>;
  //   },
  // },

  // {
  //   accessorKey: "createdAt",
  //   header: "Date Created",
  //   cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  // },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const brand = row.original;
      return (
        <ActionColumn row={row} model="brand" editEndpoint={""} id={brand.id} />
      );
    },
  },
];
