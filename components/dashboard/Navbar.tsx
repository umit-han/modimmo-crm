"use client";
import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Session } from "next-auth";
import { AvatarMenuButton } from "./AvatarMenuButton";
import Logo from "../global/Logo";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { sidebarLinks } from "@/config/sidebar";
import { usePermission } from "@/hooks/usePermissions";
import { UserDropdownMenu } from "../UserDropdownMenu";

// Organization Banner Component
const OrganizationBanner = ({
  orgName = "Acme Corporation",
  orgId = "ORG-1234",
  userRole = "Member",
}) => {
  return (
    <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex flex-col">
        <div className=" flex gap-3 items-center">
          <span className="font-medium text-xl text-foreground">{orgName}</span>
          <span className="text-sm">{userRole}</span>
        </div>
      </div>
    </div>
  );
};

export default function Navbar({ session }: { session: Session }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission } = usePermission();
  const user = session.user;
  // Get user role from session (modify as needed based on your session structure)
  const userRole = session?.user?.roles[0].displayName;

  // Filter sidebar links based on user permissions
  const filteredLinks = sidebarLinks.filter((link) => {
    // Check main link permission
    if (!hasPermission(link.permission)) {
      return false;
    }

    // If it's a dropdown, check if user has permission for any dropdown item
    if (link.dropdown && link.dropdownMenu) {
      return link.dropdownMenu.some((item) => hasPermission(item.permission));
    }

    return true;
  });

  // Flatten dropdown menus for mobile view
  const mobileLinks = filteredLinks.reduce(
    (acc, link) => {
      // Add main link if it's not a dropdown
      if (!link.dropdown) {
        acc.push({
          title: link.title,
          href: link.href || "#",
          icon: link.icon,
          permission: link.permission,
        });
        return acc;
      }

      // Add dropdown items if user has permission
      if (link.dropdownMenu) {
        link.dropdownMenu.forEach((item) => {
          if (hasPermission(item.permission)) {
            acc.push({
              title: item.title,
              href: item.href,
              icon: link.icon,
              permission: item.permission,
            });
          }
        });
      }

      return acc;
    },
    [] as Array<{ title: string; href: string; icon: any; permission: string }>
  );

  async function handleLogout() {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-muted/60 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Logo href="/dashboard" />

            {/* Mobile organization info */}
            <div className="px-3 py-2 text-sm border-b border-border mb-2">
              <div className="font-medium">{user.orgName ?? ""}</div>
              <div className="text-xs text-muted-foreground">
                ID: {user.orgId}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Role: {userRole}
              </div>
            </div>

            {/* Render mobile navigation links */}
            {mobileLinks.map((item, i) => {
              const Icon = item.icon;
              const isActive = item.href === pathname;

              return (
                <Link
                  key={i}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive && "bg-muted text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto">
            <Button onClick={handleLogout} size="sm" className="w-full">
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        {/* Organization banner for desktop */}
        <OrganizationBanner
          orgName={user?.orgName ?? ""}
          orgId={user?.orgId}
          userRole={userRole}
        />
      </div>

      <div className="p-4 ">
        <UserDropdownMenu
          username={session?.user?.name ?? ""}
          email={session?.user?.email ?? ""}
          avatarUrl={
            session?.user?.image ??
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(54)-NX3G1KANQ2p4Gupgnvn94OQKsGYzyU.png"
          }
        />
      </div>
      {/* <AvatarMenuButton session={session} /> */}
    </header>
  );
}
