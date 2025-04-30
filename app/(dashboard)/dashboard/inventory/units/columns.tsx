"use client";

import ImageColumn from "@/components/DataTableColumns/ImageColumn";

import { ColumnDef } from "@tanstack/react-table";

import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { UnitDTO, UserWithRoles } from "@/types/types";
import UserRoleBtn from "@/components/DataTableColumns/UserRoleBtn";

export const columns: ColumnDef<UnitDTO>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
  },
  {
    accessorKey: "symbol",
    header: ({ column }) => <SortableColumn column={column} title="Symbol" />,
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
      const unit = row.original;
      return (
        <ActionColumn row={row} model="unit" editEndpoint={""} id={unit.id} />
      );
    },
  },
];
