import {
  Supplier, 
  Organisation,
  User,
  Item,
} from "./index"
import {PurchaseOrderStatus, GoodsReceiptStatus} from "../enums"

export type PurchaseOrder = {
    id: string;
    poNumber: string;
    date: Date;
    supplierId: string;
    supplierName?: string;
    supplier: Supplier;
    deliveryLocationId: string;
    deliveryLocation: Location;
    status: PurchaseOrderStatus;
    subtotal: number;
    taxAmount: number;
    shippingCost?: number;
    discount?: number;
    total: number;
    notes?: string;
    paymentTerms?: string;
    expectedDeliveryDate?: Date;
    organisation: Organisation;
    orgId: string;
    createdById: string;
    createdBy: User;
    approvedById?: string;
    approvedBy?: User;
    lines: PurchaseOrderLine[];
    goodsReceipts: GoodsReceipt[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type PurchaseOrderLine = {
    id: string;
    purchaseOrderId: string;
    purchaseOrder: PurchaseOrder;
    itemId: string;
    item: Item;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    discount?: number;
    total: number;
    notes?: string;
    receivedQuantity: number;
    createdAt: Date;
    updatedAt: Date;
    goodsReceiptLines: GoodsReceiptLine[];
  };
  
  export type GoodsReceipt = {
    id: string;
    receiptNumber: string;
    date: Date;
    purchaseOrderId: string;
    purchaseOrder: PurchaseOrder;
    locationId: string;
    location: Location;
    status: GoodsReceiptStatus;
    notes?: string;
    organisation: Organisation;
    orgId: string;
    receivedById: string;
    receivedBy: User;
    lines: GoodsReceiptLine[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type GoodsReceiptLine = {
    id: string;
    goodsReceiptId: string;
    goodsReceipt: GoodsReceipt;
    purchaseOrderLineId: string;
    purchaseOrderLine: PurchaseOrderLine;
    itemId: string;
    item: Item;
    receivedQuantity: number;
    notes?: string;
    serialNumbers: string[];
    createdAt: Date;
    updatedAt: Date;
  };