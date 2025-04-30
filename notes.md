```
// Example usage in a client component
'use client';

import { usePermissions } from "@/lib/auth";

export default function ProtectedClientComponent() {
  const { hasPermission } = usePermissions();

  if (!hasPermission("users.read")) {
    return <NotAuthorized />;
  }

  return (
    <div>
      {/* Your component content */}
    </div>
  );
}

// Example with multiple permission checks
export default async function ComplexPage() {
  // Check if user has any of these permissions
  await checkAnyPermission(["users.create", "users.update"]);

  // Or check if user has all of these permissions
  await checkAllPermissions(["users.read", "roles.read"]);

  return (
    <div>
      {/* Your page content */}
    </div>
  );
}
```

// Example usage in a Server Component
import { getServerPermissions, PermissionGate } from "@/utils/server-permissions";

export default async function UserDashboard() {
const { hasPermission, hasAnyPermission } = await getServerPermissions();

return (

<div className="p-4">
<h1>User Dashboard</h1>

      {/* Using direct permission check */}
      {hasPermission("users.create") && (
        <button className="bg-blue-500 text-white px-4 py-2">
          Create User
        </button>
      )}

      {/* Using PermissionGate component */}
      <PermissionGate permission="users.delete">
        <button className="bg-red-500 text-white px-4 py-2">
          Delete User
        </button>
      </PermissionGate>

      {/* Checking multiple permissions */}
      {hasAnyPermission(["users.update", "users.manage"]) && (
        <div className="mt-4">
          <h2>User Management Section</h2>
          {/* Management content */}
        </div>
      )}
    </div>

);
}

// Example with multiple components and permissions
export async function UsersTable() {
const { hasPermission } = await getServerPermissions();

return (

<table className="min-w-full">
<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
<tr>
<td>John Doe</td>
<td>john@example.com</td>
<td className="space-x-2">
<PermissionGate permission="users.update">
<button className="text-blue-500">Edit</button>
</PermissionGate>

            <PermissionGate permission="users.delete">
              <button className="text-red-500">Delete</button>
            </PermissionGate>
          </td>
        </tr>
      </tbody>
    </table>

);
}

// Example with nested permissions and complex UI
export async function AdminDashboard() {
const { hasAllPermissions } = await getServerPermissions();

const isFullAdmin = hasAllPermissions([
"users.manage",
"roles.manage",
"settings.manage"
]);

return (

<div>
{isFullAdmin ? (
<div className="bg-green-100 p-4 rounded">
<h2>Full Admin Access</h2>
{/_ Full admin content _/}
</div>
) : (
<div className="bg-yellow-100 p-4 rounded">
<h2>Limited Access</h2>
{/_ Limited access content _/}
</div>
)}
</div>
);
}

```

// Get all suppliers for an item
const itemWithSuppliers = await prisma.item.findUnique({
  where: { id: itemId },
  include: {
    supplierRelations: {
      include: {
        supplier: true
      }
    }
  }
});

// Get all items from a specific supplier
const supplierWithItems = await prisma.supplier.findUnique({
  where: { id: supplierId },
  include: {
    itemRelations: {
      include: {
        item: true
      }
    }
  }
});

```

```
import { subDays } from "date-fns";
export async function getLatestSalesTargetsWithStats(limit: number = 3) {
  try {
    // Get the most recent sales targets
    const salesTargets = await db.saleTarget.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Calculate stats for each target
    const targetsWithStats = await Promise.all(
      salesTargets.map(async (target) => {
        // Date ranges
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = subDays(today, 1);
        const sevenDaysAgo = subDays(today, 7);
        const twentyEightDaysAgo = subDays(today, 28);

        // Today's sales
        const todaySales = await db.sale.findMany({
          where: {
            targetId: target.id,
            createdAt: {
              gte: today,
            },
          },
        });

        const todaySalesCount = todaySales.length;
        const todaySalesRevenue = todaySales.reduce(
          (acc, sale) => acc + sale.total,
          0
        );

        // Last 7 days sales
        const last7DaysSales = await db.sale.findMany({
          where: {
            targetId: target.id,
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        });

        const last7DaysSalesCount = last7DaysSales.length;
        const last7DaysSalesRevenue = last7DaysSales.reduce(
          (acc, sale) => acc + sale.total,
          0
        );

        // Last 28 days sales
        const last28DaysSales = await db.sale.findMany({
          where: {
            targetId: target.id,
            createdAt: {
              gte: twentyEightDaysAgo,
            },
          },
        });

        const last28DaysSalesCount = last28DaysSales.length;
        const last28DaysSalesRevenue = last28DaysSales.reduce(
          (acc, sale) => acc + sale.total,
          0
        );

        // Total sales
        const totalSales = await db.sale.findMany({
          where: {
            targetId: target.id,
          },
        });

        const totalSalesCount = totalSales.length;
        const totalSalesRevenue = totalSales.reduce(
          (acc, sale) => acc + sale.total,
          0
        );

        // Combine target with stats
        return {
          ...target,
          stats: {
            today: {
              count: todaySalesCount,
              revenue: todaySalesRevenue,
            },
            last7Days: {
              count: last7DaysSalesCount,
              revenue: last7DaysSalesRevenue,
            },
            last28Days: {
              count: last28DaysSalesCount,
              revenue: last28DaysSalesRevenue,
            },
            total: {
              count: totalSalesCount,
              revenue: totalSalesRevenue,
            },
          },
        };
      })
    );

    return {
      success: true,
      data: targetsWithStats,
    };
  } catch (error) {
    console.error("Error fetching sales targets with stats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch sales targets with stats",
    };
  }
}
```
