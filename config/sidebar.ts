// config/sidebar.ts
import {
  BaggageClaim,
  BarChart2,
  BarChart4,
  Book,
  Cable,
  CircleDollarSign,
  FolderTree,
  Home,
  LucideIcon,
  Presentation,
  Settings,
  Users,
  ShoppingCart,
  Box,
  Repeat,
  FileEdit,
  Link,
  Store,
  UserCog,
  Building,
} from "lucide-react";

export interface ISidebarLink {
  title: string;
  href?: string;
  icon: LucideIcon;
  dropdown: boolean;
  permission: string; // Required permission to view this item
  dropdownMenu?: MenuItem[];
}

type MenuItem = {
  title: string;
  href: string;
  permission: string; // Required permission to view this menu item
};

export const sidebarLinks: ISidebarLink[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    dropdown: false,
    permission: "dashboard.read",
  },
  {
    title: "Inventory",
    icon: BaggageClaim,
    dropdown: true,
    href: "/dashboard/inventory/items",
    permission: "inventory.read",
    dropdownMenu: [
      {
        title: "Items",
        href: "/dashboard/inventory/items",
        permission: "items.read",
      },
      {
        title: "Categories",
        href: "/dashboard/inventory/categories",
        permission: "categories.read",
      },
      {
        title: "Brands",
        href: "/dashboard/inventory/brands",
        permission: "brands.read",
      },
      {
        title: "Units",
        href: "/dashboard/inventory/units",
        permission: "units.read",
      },
      {
        title: "Current Stock",
        href: "/dashboard/inventory/stock",
        permission: "stock.read",
      },
      {
        title: "Low Stock Items",
        href: "/dashboard/inventory/stock/low-stock",
        permission: "stock.read",
      },
      {
        title: "Serial Numbers",
        href: "/dashboard/inventory/serial-numbers",
        permission: "serial.numbers.read",
      },
      {
        title: "Stock Transfers",
        href: "/dashboard/inventory/transfers",
        permission: "transfers.read",
      },
      {
        title: "Stock Adjustments",
        href: "/dashboard/inventory/adjustments",
        permission: "adjustments.read",
      },
    ],
  },

  {
    title: "Purchases",
    icon: ShoppingCart,
    dropdown: true,
    href: "/dashboard/purchases/orders",
    permission: "purchase.orders.read",
    dropdownMenu: [
      {
        title: "Purchase Orders",
        href: "/dashboard/purchases/purchase-orders",
        permission: "purchase.orders.read",
      },
      {
        title: "Goods Receipt",
        href: "/dashboard/purchases/goods-receipt",
        permission: "goods.receipts.read",
      },
      {
        title: "Suppliers",
        href: "/dashboard/purchases/suppliers",
        permission: "suppliers.read",
      },
    ],
  },
  {
    title: "Sales",
    icon: CircleDollarSign,
    dropdown: true,
    href: "/dashboard/sales/orders",
    permission: "sales.read",
    dropdownMenu: [
      {
        title: "POS Sales",
        href: "/dashboard/sales/pos",
        permission: "pos.access",
      },
      {
        title: "Sales Orders",
        href: "/dashboard/sales/orders",
        permission: "sales.orders.read",
      },
      {
        title: "Customers",
        href: "/dashboard/sales/customers",
        permission: "customers.read",
      },
    ],
  },
  {
    title: "Reports",
    icon: BarChart4,
    dropdown: true,
    href: "/dashboard/reports/stock-movement",
    permission: "reports.read",
    dropdownMenu: [
      {
        title: "Stock Movement",
        href: "/dashboard/reports/stock-movements",
        permission: "reports.inventory.read",
      },
      {
        title: "Sales report",
        href: "/dashboard/reports/sales",
        permission: "reports.inventory.read",
      },
    ],
  },
  {
    title: "Integrations",
    icon: Link,
    dropdown: true,
    href: "/dashboard/integrations/pos",
    permission: "integrations.access",
    dropdownMenu: [
      {
        title: "POS Integration",
        href: "/dashboard/integrations/pos",
        permission: "integrations.pos.access",
      },
      {
        title: "Accounting Integration",
        href: "/dashboard/integrations/accounting",
        permission: "integrations.accounting.access",
      },
      {
        title: "E-commerce Integration",
        href: "/dashboard/integrations/ecommerce",
        permission: "integrations.ecommerce.access",
      },
      {
        title: "API Keys",
        href: "/dashboard/integrations/api",
        permission: "integrations.api.access",
      },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    dropdown: true,
    permission: "settings.access",
    dropdownMenu: [
      {
        title: "Locations",
        href: "/dashboard/settings/locations",
        permission: "locations.read",
      },

      {
        title: "Tax Rates",
        href: "/dashboard/settings/tax-rates",
        permission: "tax.read",
      },

      {
        title: "Users & Invites",
        href: "/dashboard/settings/users",
        permission: "users.read",
      },
      {
        title: "Roles & Permissions",
        href: "/dashboard/settings/roles",
        permission: "roles.read",
      },
      {
        title: "Company Settings",
        href: "/dashboard/settings/company",
        permission: "company.settings.access",
      },
      {
        title: "Profile",
        href: "/dashboard/profile",
        permission: "profile.read",
      },
      {
        title: "Change Password",
        href: "/dashboard/settings/change-password",
        permission: "password.change",
      },
    ],
  },
];
