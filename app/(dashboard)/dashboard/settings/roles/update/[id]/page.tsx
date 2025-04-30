import React from "react";
// import { getRoleById } from "@/actions/roles";
import RoleForm from "@/components/Forms/RoleForm";
import { getRoleById } from "@/actions/roles";
import NotFound from "@/app/not-found";
import { getAuthenticatedUser } from "@/config/useAuth";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const { data } = await getRoleById(id);
  const user = await getAuthenticatedUser();
  const orgId = user.orgId;
  if (!id || !data) {
    return NotFound();
  }
  return <RoleForm orgId={orgId} editingId={id} initialData={data} />;
}
