"use client";

import { ColumnDef } from "@tanstack/react-table";

import ActionColumn from "@/components/DataTableColumns/ActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { TaxDTO } from "@/types/types";

export const columns: ColumnDef<TaxDTO>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
  },
  {
    accessorKey: "rate",
    header: ({ column }) => <SortableColumn column={column} title="Rate" />,
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
      const tax = row.original;
      return (
        <ActionColumn row={row} model="tax" editEndpoint={""} id={tax.id} />
      );
    },
  },
];
