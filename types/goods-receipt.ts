import {
  GoodsReceipt as PrismaGoodsReceipt,
  GoodsReceiptLine,
  PurchaseOrder as PrismaPurchaseOrder,
  Supplier,
  PurchaseOrderLine,
} from "@prisma/client";

interface PurchaseOrder extends PrismaPurchaseOrder {
  supplier: Supplier;
  lines: PurchaseOrderLine[];
}

// type GoodsReceiptLine = {
//   id: string;
//   goodsReceiptId: string;
//   purchaseOrderLineId: string;
//   itemId: string;
//   receivedQuantity: number;
//   notes?: string | null;
//   serialNumbers: string[];
//   createdAt: Date;
//   updatedAt: Date;
//   // Add any other goods receipt line fields you need
// };

// Define the main return type
export interface GoodsReceipt extends PrismaGoodsReceipt {
  lines: GoodsReceiptLine[];
  purchaseOrder: PurchaseOrder;
}
