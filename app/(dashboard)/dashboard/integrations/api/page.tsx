import { getOrgApiKeys } from "@/actions/apiKeys";
import { ApiKeyManagement } from "@/components/dashboard/api-key-management";
import { getAuthenticatedUser } from "@/config/useAuth";

export default async function Home() {
  const user = await getAuthenticatedUser();
  const apiKeys = await getOrgApiKeys(user.orgId);
  return (
    <main className="sm:container mx-auto py-8 px-2 sm:px-4">
      <ApiKeyManagement orgKeys={apiKeys} />
    </main>
  );
}
