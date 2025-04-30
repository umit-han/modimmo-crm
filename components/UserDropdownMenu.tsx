"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  CreditCard,
  LogOut,
  Settings,
  Sparkles,
  ChevronsUpDown,
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingCart,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserDropdownProps {
  username: string;
  email: string;
  avatarUrl?: string;
}

export function UserDropdownMenu({
  username,
  email,
  avatarUrl,
}: UserDropdownProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.log(error);
    }
  }

  const handleUpgrade = () => {
    // Add your upgrade logic here
    console.log("Upgrading to Pro...");
  };

  // Quick link data
  const quickLinks = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Stock", icon: Package, href: "/dashboard/inventory/stock" },
    {
      name: "Purchase Orders",
      icon: ClipboardList,
      href: "/dashboard/purchases/purchase-orders",
    },
    {
      name: "Sales Orders",
      icon: ShoppingCart,
      href: "/dashboard/sales/orders",
    },
    { name: "Profile", icon: User, href: "/dashboard/settings/profile" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-full justify-start gap-2 px-4"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>{username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{username}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* Quick Links Section */}
        <DropdownMenuLabel>Quick Links</DropdownMenuLabel>
        <DropdownMenuGroup>
          {quickLinks.map((link) => (
            <DropdownMenuItem
              key={link.href}
              asChild
              className="cursor-pointer"
            >
              <Link href={link.href} className="flex w-full items-center">
                <link.icon className="mr-2 h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Original Menu Items */}
        {/* <DropdownMenuItem onClick={handleUpgrade} className="cursor-pointer">
          <Sparkles className="mr-2 h-4 w-4" />
          <span>Upgrade to Pro</span>
        </DropdownMenuItem> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
