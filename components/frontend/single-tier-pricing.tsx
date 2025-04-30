import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  X,
  Star,
  Building,
  CircleDollarSign,
  Users,
  ShoppingCart,
  Link2,
  MapPin,
  ShieldCheck,
  ExternalLink,
  Package,
} from "lucide-react";

interface PricingFeature {
  name: string;
  entrepreneur: string | boolean;
  smallBusiness: string | boolean;
  midSize: string | boolean;
  icon: React.ReactNode;
}

interface PricingTiersProps {
  theme?: "light" | "dark";
}

const PricingTiers: React.FC<PricingTiersProps> = ({ theme = "light" }) => {
  const isDark = theme === "dark";

  const features: PricingFeature[] = [
    {
      name: "Team members",
      entrepreneur: "2 members",
      smallBusiness: "5 members",
      midSize: "10 members",
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: "Sales orders/yr",
      entrepreneur: "1,200 orders/yr",
      smallBusiness: "12,000 orders/yr",
      midSize: "60,000 orders/yr",
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      name: "Integrations",
      entrepreneur: "1 integration",
      smallBusiness: "2 integrations",
      midSize: "3 integrations",
      icon: <Link2 className="w-4 h-4" />,
    },
    {
      name: "Inventory locations",
      entrepreneur: "1 location (no sublocations)",
      smallBusiness: "Unlimited",
      midSize: "Unlimited",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      name: "User access rights",
      entrepreneur: false,
      smallBusiness: true,
      midSize: "Advanced",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      name: "Access to inFlow API",
      entrepreneur: false,
      smallBusiness: "Add-on",
      midSize: "Add-on",
      icon: <ExternalLink className="w-4 h-4" />,
    },
    {
      name: "Showroom",
      entrepreneur: false,
      smallBusiness: true,
      midSize: "Showroom Pro",
      icon: <Building className="w-4 h-4" />,
    },
    {
      name: "Serial numbers",
      entrepreneur: "Add-on",
      smallBusiness: "Add-on",
      midSize: "Add-on",
      icon: <Package className="w-4 h-4" />,
    },
  ];

  return (
    <section
      id="pricing"
      className={`w-full max-w-7xl mx-auto py-20 px-6 ${
        isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
      }`}
    >
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Choose the Perfect Plan for Your
          <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            {" "}
            Inventory Needs
          </span>
        </h2>
        <p
          className={`text-xl max-w-3xl mx-auto ${isDark ? "text-slate-300" : "text-slate-600"}`}
        >
          Scale your inventory management solution as your business grows. All
          plans include core inventory tracking features.
        </p>
      </div>

      <div className="flex flex-wrap items-stretch justify-center gap-8 mb-8 ">
        {/* Entrepreneur Plan */}
        <div
          className={`flex flex-col w-full md:w-80 rounded-2xl overflow-hidden ${
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border border-slate-200"
          } shadow-md`}
        >
          <div className="p-6 space-y-4">
            <h3 className="text-2xl font-bold">Entrepreneur</h3>
            <div className="space-y-1">
              <p className="text-sm">Starts at</p>
              <p className="text-5xl font-bold">$149</p>
              <p className="text-sm">USD/mo.</p>
            </div>
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                isDark
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              billed annually
            </div>
            <Button variant="outline" className="w-full mt-4">
              Get started
            </Button>
          </div>

          <div
            className={`flex-1 p-6 ${isDark ? "bg-slate-750" : "bg-slate-50"}`}
          >
            <p className="font-medium mb-4">Includes:</p>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex-shrink-0">
                    {feature.entrepreneur === false ? (
                      <div className="p-1 rounded-full bg-red-100">
                        <X className="w-3 h-3 text-red-500" />
                      </div>
                    ) : feature.entrepreneur === true ? (
                      <div className="p-1 rounded-full bg-teal-100">
                        <CheckCircle className="w-3 h-3 text-teal-500" />
                      </div>
                    ) : feature.entrepreneur.includes("Add-on") ? (
                      <div className="p-1 rounded-full bg-amber-100">
                        <Star className="w-3 h-3 text-amber-500" />
                      </div>
                    ) : (
                      <div className="p-1 rounded-full bg-blue-100">
                        {feature.icon}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{feature.name}</div>
                    <div
                      className={isDark ? "text-slate-400" : "text-slate-600"}
                    >
                      {feature.entrepreneur === true
                        ? "Included"
                        : feature.entrepreneur === false
                          ? "Not included"
                          : feature.entrepreneur}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Small Business Plan - Popular */}
        <div
          className={`flex flex-col w-full md:w-80 rounded-2xl overflow-hidden ${
            isDark
              ? "bg-amber-900/20 border-amber-500/30"
              : "bg-amber-50 border border-amber-200"
          } shadow-xl relative`}
        >
          <div className="absolute top-0 inset-x-0 bg-amber-500 text-white text-sm font-bold py-1 text-center">
            MOST POPULAR
          </div>
          <div className="p-6 space-y-4 pt-10">
            <h3 className="text-2xl font-bold">Small Business</h3>
            <div className="space-y-1">
              <p className="text-sm">Starts at</p>
              <p className="text-5xl font-bold">$349</p>
              <p className="text-sm">USD/mo.</p>
            </div>
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                isDark
                  ? "bg-amber-900/40 text-amber-200"
                  : "bg-amber-200 text-amber-800"
              }`}
            >
              billed annually
            </div>
            <Button className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white">
              Contact sales
            </Button>
          </div>

          <div
            className={`flex-1 p-6 ${
              isDark ? "bg-amber-900/10" : "bg-amber-50/80"
            }`}
          >
            <p className="font-medium mb-4">Includes:</p>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex-shrink-0">
                    {feature.smallBusiness === false ? (
                      <div className="p-1 rounded-full bg-red-100">
                        <X className="w-3 h-3 text-red-500" />
                      </div>
                    ) : feature.smallBusiness === true ? (
                      <div className="p-1 rounded-full bg-teal-100">
                        <CheckCircle className="w-3 h-3 text-teal-500" />
                      </div>
                    ) : feature.smallBusiness.includes("Add-on") ? (
                      <div className="p-1 rounded-full bg-amber-200">
                        <Star className="w-3 h-3 text-amber-700" />
                      </div>
                    ) : (
                      <div className="p-1 rounded-full bg-blue-100">
                        {feature.icon}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{feature.name}</div>
                    <div
                      className={isDark ? "text-slate-300" : "text-slate-700"}
                    >
                      {feature.smallBusiness === true
                        ? "Included"
                        : feature.smallBusiness === false
                          ? "Not included"
                          : feature.smallBusiness}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mid-Size Plan */}
        <div
          className={`flex flex-col w-full md:w-80 rounded-2xl overflow-hidden ${
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border border-slate-200"
          } shadow-md`}
        >
          <div className="p-6 space-y-4">
            <h3 className="text-2xl font-bold">Mid-Size</h3>
            <div className="space-y-1">
              <p className="text-sm">Starts at</p>
              <p className="text-5xl font-bold">$799</p>
              <p className="text-sm">USD/mo.</p>
            </div>
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                isDark
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              billed annually
            </div>
            <Button variant="outline" className="w-full mt-4">
              Get started
            </Button>
          </div>

          <div
            className={`flex-1 p-6 ${isDark ? "bg-slate-750" : "bg-slate-50"}`}
          >
            <p className="font-medium mb-4">Includes:</p>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex-shrink-0">
                    {feature.midSize === false ? (
                      <div className="p-1 rounded-full bg-red-100">
                        <X className="w-3 h-3 text-red-500" />
                      </div>
                    ) : feature.midSize === true ? (
                      <div className="p-1 rounded-full bg-teal-100">
                        <CheckCircle className="w-3 h-3 text-teal-500" />
                      </div>
                    ) : feature.midSize.includes("Add-on") ? (
                      <div className="p-1 rounded-full bg-amber-100">
                        <Star className="w-3 h-3 text-amber-500" />
                      </div>
                    ) : feature.midSize.includes("Advanced") ||
                      feature.midSize.includes("Pro") ? (
                      <div className="p-1 rounded-full bg-blue-200">
                        <CheckCircle className="w-3 h-3 text-blue-700" />
                      </div>
                    ) : (
                      <div className="p-1 rounded-full bg-blue-100">
                        {feature.icon}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{feature.name}</div>
                    <div
                      className={isDark ? "text-slate-400" : "text-slate-600"}
                    >
                      {feature.midSize === true
                        ? "Included"
                        : feature.midSize === false
                          ? "Not included"
                          : feature.midSize}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom upsell card */}
      <div
        className={`max-w-3xl mx-auto mt-12 p-6 rounded-xl ${
          isDark
            ? "bg-blue-900/20 border border-blue-700/30"
            : "bg-blue-50 border border-blue-100"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <CircleDollarSign
            className={`w-12 h-12 ${
              isDark ? "text-blue-400" : "text-blue-500"
            }`}
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">
              Need a custom enterprise solution?
            </h3>
            <p className={isDark ? "text-slate-300" : "text-slate-600"}>
              Contact our sales team for a tailored inventory management
              solution that fits your specific business requirements.
            </p>
          </div>
          <Button
            className={`${
              isDark
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white shrink-0`}
          >
            Contact us
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingTiers;
