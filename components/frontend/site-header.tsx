"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  Users,
  BarChart2,
  FileText,
  Layout,
  CloudUpload,
  Edit3,
  Database,
  BarChart,
  Lock,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

import Logo from "../global/Logo";
import { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/generateInitials";

const features = [
  {
    icon: Database,
    title: "Product Catalog Management",
    description:
      "Create and manage products with custom attributes, SKUs, categories, pricing, and stock level settings.",
    href: "/features/product-catalog",
  },
  {
    icon: BarChart2,
    title: "Real-time Inventory Tracking",
    description:
      "Monitor stock levels across multiple locations with automated alerts for low inventory and detailed history logs.",
    href: "/features/inventory-tracking",
  },
  {
    icon: Map,
    title: "Multi-location Support",
    description:
      "Seamlessly manage inventory across different store locations with easy stock transfer capabilities.",
    href: "/features/multi-location",
  },
  {
    icon: Edit3,
    title: "Stock Adjustment Tools",
    description:
      "Record and track inventory changes with custom reason codes, audit trails, and adjustment history.",
    href: "/features/stock-adjustments",
  },
  {
    icon: ShoppingCart,
    title: "Sales Order Management",
    description:
      "Process customer orders efficiently with status tracking, customizable invoicing, and fulfillment monitoring.",
    href: "/features/sales-orders",
  },
  {
    icon: Users,
    title: "Customer Relationship Management",
    description:
      "Maintain comprehensive customer profiles with segmentation, purchase history, and specialized pricing tiers.",
    href: "/features/customer-management",
  },
  {
    icon: ShoppingBag,
    title: "Purchase Order System",
    description:
      "Create and track supplier orders with receiving functionality and automated reordering capabilities.",
    href: "/features/purchase-orders",
  },
  {
    icon: Truck,
    title: "Supplier Management",
    description:
      "Manage supplier relationships, link products to suppliers, and track performance metrics.",
    href: "/features/supplier-management",
  },
  {
    icon: FileText,
    title: "Comprehensive Reporting",
    description:
      "Generate detailed reports for inventory levels, sales performance, purchase orders, and stock forecasting.",
    href: "/features/reporting",
  },
  {
    icon: Lock,
    title: "Role-based Access Control",
    description:
      "Secure user management with customizable permissions for different staff roles and responsibilities.",
    href: "/features/user-management",
  },
];

export default function SiteHeader({ session }: { session: Session | null }) {
  const [open, setOpen] = React.useState(false);
  const [showFeatures, setShowFeatures] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
      <div className="container max-w-7xl mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Logo />
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[800px] p-4">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                      <h4 className="text-lg font-medium">Features</h4>
                      <Link
                        href="/features"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3 ">
                      {features.map((feature, index) => (
                        <Link
                          key={index}
                          href={`/feature/${feature.title
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className="block group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-muted rounded-md group-hover:bg-muted/80">
                              <feature.icon className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                              <h5 className="font-medium mb-1 group-hover:text-blue-500">
                                {feature.title}
                              </h5>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium mb-1">Get started</h4>
                          <p className="text-sm text-muted-foreground">
                            Am really excited for all these features out of the
                            box
                          </p>
                        </div>
                        <Button asChild variant="secondary">
                          <Link
                            target="_blank"
                            href="https://coding-school-typescript.vercel.app/give-away"
                          >
                            Get started
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/#pricing" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        {session ? (
          <Button asChild variant={"ghost"}>
            <Link href="/dashboard">
              <Avatar>
                <AvatarImage
                  src={session?.user?.image ?? ""}
                  alt={session?.user?.name ?? ""}
                />
                <AvatarFallback>
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="ml-3">Dashboard</span>
            </Link>
          </Button>
        ) : (
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link href={"/login"}>Log in</Link>
            </Button>
            <Button>
              <Link href="/register">Signup</Link>
            </Button>
          </div>
        )}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-left">Navigation</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col py-4">
              <Link
                href="/"
                className="px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
              <button
                className="flex items-center justify-between px-4 py-2 text-lg font-medium hover:bg-accent text-left"
                onClick={() => setShowFeatures(!showFeatures)}
              >
                Features
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    showFeatures && "rotate-180"
                  )}
                />
              </button>
              {showFeatures && (
                <div className="px-4 py-2 space-y-4">
                  {features.map((feature, index) => (
                    <Link
                      key={index}
                      href={`/feature/${feature.title
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className="flex items-start gap-4 py-2"
                      onClick={() => setOpen(false)}
                    >
                      <div className="p-2 bg-muted rounded-md">
                        <feature.icon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">{feature.title}</h5>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href="/#pricing"
                className="px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/how-it-works"
                className="px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                How it works
              </Link>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Button>
                <Button className="w-full" onClick={() => setOpen(false)}>
                  Sign up
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
