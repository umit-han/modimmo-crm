"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  Search,
  Trash2,
  Plus,
  Minus,
  Loader2,
  ArrowLeft,
  ShoppingCart,
  UserPlus,
  Receipt,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { createPOSSale } from "@/actions/pos";
import InvoiceButton from "@/app/(dashboard)/dashboard/sales/orders/components/InvoiceButton";

// Types
type Item = {
  id: string;
  name: string;
  sku: string;
  description?: string;
  thumbnail?: string;
  sellingPrice: number;
  costPrice: number;
  tax?: number;
  categoryId?: string;
  category?: {
    id: string;
    title: string;
  };
  inventories: Array<{
    id: string;
    quantity: number;
    locationId: string;
  }>;
};

export type Category = {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  items: Item[];
};

type Customer = {
  id: string;
  name: string;
};

type Location = {
  id: string;
  name: string;
  type: string;
};

type OrderLine = {
  id: string;
  itemId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discount?: number;
  total: number;
  serialNumbers?: string[];
};

interface POSInterfaceProps {
  customers: Customer[];
  locations: Location[];
  categoriesWithItems: Category[];
  userId: string;
  orgId: string;
}

export function POSInterface({
  customers,
  locations,
  categoriesWithItems,
  userId,
  orgId,
}: POSInterfaceProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categoriesWithItems[0]?.id || ""
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    locations.find((loc) => loc.type === "SHOP")?.id || locations[0]?.id || ""
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("CASH");
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  // Filter items based on search and category
  const filteredItems =
    categoriesWithItems
      .find((cat) => cat.id === selectedCategoryId)
      ?.items.filter((item) =>
        searchQuery
          ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      ) || [];

  // Calculate stock for each item at the selected location
  const getItemStock = (item: Item) => {
    const inventory = item.inventories.find(
      (inv) => inv.locationId === selectedLocationId
    );
    return inventory ? inventory.quantity : 0;
  };

  // Recalculate totals when orderLines change
  useEffect(() => {
    calculateTotals();
  }, [orderLines, shipping, discount]);

  // Calculate totals
  const calculateTotals = () => {
    let calculatedSubtotal = 0;
    let calculatedTax = 0;

    // Calculate line totals
    orderLines.forEach((line) => {
      calculatedSubtotal += line.quantity * line.unitPrice;
      calculatedTax += line.taxAmount;
    });

    setSubtotal(parseFloat(calculatedSubtotal.toFixed(2)));
    setTotalTax(parseFloat(calculatedTax.toFixed(2)));

    // Calculate grand total
    const total = calculatedSubtotal + calculatedTax + shipping - discount;
    setGrandTotal(parseFloat(total.toFixed(2)));
  };

  // Handle adding an item to the order
  const addItemToOrder = (item: Item) => {
    // Check if item already exists in order
    const existingLine = orderLines.find((line) => line.itemId === item.id);

    if (existingLine) {
      // Update quantity of existing line
      const updatedLines = orderLines.map((line) =>
        line.itemId === item.id
          ? {
              ...line,
              quantity: line.quantity + 1,
              taxAmount: parseFloat(
                (
                  ((line.quantity + 1) * line.unitPrice * (item.tax || 0)) /
                  100
                ).toFixed(2)
              ),
              total: parseFloat(
                (
                  (line.quantity + 1) * line.unitPrice +
                  ((line.quantity + 1) * line.unitPrice * (item.tax || 0)) /
                    100 -
                  (line.discount || 0)
                ).toFixed(2)
              ),
            }
          : line
      );
      setOrderLines(updatedLines);
    } else {
      // Add new line
      const taxRate = item.tax || 0;
      const taxAmount = parseFloat(
        ((item.sellingPrice * taxRate) / 100).toFixed(2)
      );
      const total = parseFloat((item.sellingPrice + taxAmount).toFixed(2));

      const newLine: OrderLine = {
        id: uuidv4(),
        itemId: item.id,
        name: item.name,
        sku: item.sku,
        quantity: 1,
        unitPrice: item.sellingPrice,
        taxRate,
        taxAmount,
        discount: 0,
        total,
      };

      setOrderLines([...orderLines, newLine]);
    }
  };

  // Handle removing an item from the order
  const removeOrderLine = (lineId: string) => {
    setOrderLines(orderLines.filter((line) => line.id !== lineId));
  };

  // Handle changing quantity of an item in the order
  const updateLineQuantity = (lineId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedLines = orderLines.map((line) => {
      if (line.id === lineId) {
        const taxAmount = parseFloat(
          ((newQuantity * line.unitPrice * line.taxRate) / 100).toFixed(2)
        );
        const total = parseFloat(
          (
            newQuantity * line.unitPrice +
            taxAmount -
            (line.discount || 0)
          ).toFixed(2)
        );

        return {
          ...line,
          quantity: newQuantity,
          taxAmount,
          total,
        };
      }
      return line;
    });

    setOrderLines(updatedLines);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Handle payment / order submission
  const handlePayment = async () => {
    if (orderLines.length === 0) {
      toast.error("Cannot create a sale with no items");
      return;
    }

    if (!selectedLocationId) {
      toast.error("Please select a location");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPOSSale({
        date: new Date(),
        customerId: selectedCustomerId || undefined,
        locationId: selectedLocationId,
        paymentMethod: selectedPaymentMethod,
        subtotal,
        taxAmount: totalTax,
        shippingCost: shipping,
        discount,
        total: grandTotal,
        userId,
        orgId,
        lines: orderLines.map((line) => ({
          itemId: line.itemId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          taxAmount: line.taxAmount,
          discount: line.discount,
          total: line.total,
          serialNumbers: line.serialNumbers || [],
        })),
      });

      if (result.success && result.data) {
        toast.success("Sale completed successfully");
        // Store the order ID for invoice link
        setInvoiceId(result.data.id);
        // Reset the cart
        setOrderLines([]);
        setShipping(0);
        setDiscount(0);
      } else {
        toast.error(result.error || "Failed to complete sale");
      }
    } catch (error) {
      console.error("Error completing sale:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the current cart
  const resetCart = () => {
    setOrderLines([]);
    setShipping(0);
    setDiscount(0);
    setInvoiceId(null);
  };

  const paymentMethodOptions = [
    { label: "Cash", value: "CASH" },
    { label: "Credit Card", value: "CREDIT_CARD" },
    { label: "Bank Transfer", value: "BANK_TRANSFER" },
    { label: "Mobile Money", value: "MOBILE_MONEY" },
    { label: "Check", value: "CHECK" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white shadow-sm border-b py-2 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Inventory Pro POS</h1>
        </div>
        <div className="flex items-center space-x-2">
          {invoiceId && <InvoiceButton orderId={invoiceId} />}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Products */}
        <div className="w-2/3 flex flex-col bg-gray-50 overflow-hidden">
          {/* Search and Filters */}
          <div className="p-4 bg-white border-b">
            <div className="flex space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search product code or name..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedLocationId}
                onValueChange={setSelectedLocationId}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto pb-2 -mx-1">
              {categoriesWithItems.map((category) => (
                <button
                  key={category.id}
                  className={`flex flex-col items-center p-2 mx-1 rounded-lg min-w-[80px] ${
                    selectedCategoryId === category.id
                      ? "bg-blue-100 text-blue-700 border-blue-300 border"
                      : "bg-white border hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md mb-1">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.title}
                        width={32}
                        height={32}
                        className="rounded-md"
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">No img</div>
                    )}
                  </div>
                  <span className="text-xs font-medium truncate max-w-[80px]">
                    {category.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const stock = getItemStock(item);

                return (
                  <button
                    key={item.id}
                    className={`flex flex-col bg-white rounded-lg border p-3 hover:shadow-md transition-shadow ${
                      stock <= 0 ? "opacity-60" : ""
                    }`}
                    onClick={() => stock > 0 && addItemToOrder(item)}
                    disabled={stock <= 0}
                  >
                    <div className="relative w-full h-32 bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.name}
                          fill
                          className="object-contain rounded-md p-1"
                        />
                      ) : (
                        <div className="text-gray-400">No image</div>
                      )}
                      <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {stock} in stock
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="text-xs text-gray-500 mb-1">
                        SKU: {item.sku}
                      </div>
                      <div className="text-blue-600 font-bold">
                        {formatCurrency(item.sellingPrice)}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full flex items-center justify-center h-40 text-gray-500">
                No items found
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="w-1/3 bg-white border-l flex flex-col overflow-hidden">
          {/* Cart Header */}
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg mb-3">Current Order</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <SearchableSelect
                placeholder="Walk-in Customer"
                options={customers.map((c) => ({ label: c.name, value: c.id }))}
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
                emptyMessage="No customers found"
                clearable
              />
              <Select
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-gray-500">
              {orderLines.length} item(s),{" "}
              {orderLines.reduce((sum, line) => sum + line.quantity, 0)} total
              quantity
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-2">
            {orderLines.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCart className="h-12 w-12 mb-2 opacity-30" />
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="divide-y">
                {orderLines.map((line) => (
                  <div key={line.id} className="py-3 px-2">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-medium line-clamp-1 flex-1">
                        {line.name}
                      </h3>
                      <button
                        onClick={() => removeOrderLine(line.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      SKU: {line.sku}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() =>
                            updateLineQuantity(line.id, line.quantity - 1)
                          }
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                          disabled={line.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateLineQuantity(line.id, line.quantity + 1)
                          }
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {formatCurrency(line.unitPrice)} × {line.quantity}
                        </div>
                        <div className="font-bold">
                          {formatCurrency(line.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="border-t p-4 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax:</span>
                <span>{formatCurrency(totalTax)}</span>
              </div>
              {/* <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Shipping:</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shipping}
                  onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                  className="w-24 h-8 text-right"
                />
              </div> */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Discount:</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 h-8 text-right"
                />
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetCart}
                disabled={orderLines.length === 0 || isSubmitting}
              >
                Reset
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={orderLines.length === 0 || isSubmitting}
                onClick={handlePayment}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay Now</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
