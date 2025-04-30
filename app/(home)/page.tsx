import Iframe from "react-iframe";

import TechStackGrid from "@/components/frontend/Techstack";
import { GridBackground } from "@/components/reusable-ui/grid-background";

import ReUsableHero from "@/components/reusable-ui/reusable-hero";
import { Database, BarChart2, ShoppingCart } from "lucide-react";
import React from "react";
import Image from "next/image";
import { BorderBeam } from "@/components/magicui/border-beam";

import InventoryComparison from "@/components/reusable-ui/project-comparison";
import InventoryFeatureTabs from "@/components/frontend/SmoothTabs";
import PricingTiers from "@/components/frontend/single-tier-pricing";
import InventoryFAQ from "@/components/frontend/FAQ";
import { getCurrentUsersCount } from "@/actions/users";

export default async function page() {
  const currentUsers = await getCurrentUsersCount();
  console.log(currentUsers);
  return (
    <section>
      <ReUsableHero
        theme="dark"
        announcement={{
          text: "New: Multi-location inventory tracking now available",
        }}
        title={
          <>
            Simplify Your Inventory
            <br />
            Management with Inventory Pro
          </>
        }
        mobileTitle="Simplify Inventory Management with Inventory Pro"
        subtitle="Inventory Pro offers a comprehensive solution for businesses to track products, manage stock levels across multiple locations, process sales orders, and handle supplier relationships. Boost efficiency, reduce stockouts, and gain valuable insights with our powerful yet easy-to-use inventory management system."
        buttons={[
          {
            label: "Start Free Trial",
            href: "/register",
            primary: true,
          },
          {
            label: "View Demo",
            href: "/#demo",
          },
        ]}
        icons={[
          { icon: Database, position: "left" }, // Database icon for inventory/products
          { icon: BarChart2, position: "right" }, // Chart for reporting/analytics
          { icon: ShoppingCart, position: "center" }, // Cart for sales orders
        ]}
        backgroundStyle="red"
        className="min-h-[70vh]"
        userCount={currentUsers > 1 ? currentUsers : null}
      />
      <GridBackground>
        <div className="px-8 py-16 ">
          <TechStackGrid />
        </div>
      </GridBackground>
      <div className="py-16 max-w-6xl mx-auto px-8">
        <div className="relative rounded-lg overflow-hidden">
          <BorderBeam />
          <Image
            src="/images/dash-2.webp"
            alt="This is the dashbaord Image"
            width={1775}
            height={1109}
            className="w-full h-full rounded-lg object-cover  border shadow-2xl"
          />
        </div>
      </div>
      <InventoryComparison />
      <GridBackground className="">
        <InventoryFeatureTabs />
      </GridBackground>

      <div id="demo" className="py-16 max-w-6xl mx-auto relative">
        <Iframe
          url="https://www.youtube.com/embed/7I1SCPXqdlk?si=7wqRSctobSlLVUM-"
          width="100%"
          className="h-[32rem] rounded-lg"
          display="block"
          position="relative"
        />

        <div className="py-8">
          <PricingTiers />
        </div>
      </div>
      <InventoryFAQ />
    </section>
  );
}
