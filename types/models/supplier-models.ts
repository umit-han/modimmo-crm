import {
    Organisation,
    Item,
    PurchaseOrder
} from "./index"

export type Supplier = {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    paymentTerms?: number;
    notes?: string;
    isActive: boolean;
    organisation: Organisation;
    orgId: string;
    createdAt: Date;
    updatedAt: Date;
    
    // Relationships
    itemIds: string[];
    items: Item[];
    supplierRelations: ItemSupplier[];
    purchaseOrders: PurchaseOrder[];
  };
  
  export type ItemSupplier = {
    id: string;
    itemId: string;
    item: Item;
    supplierId: string;
    supplier: Supplier;
    isPreferred: boolean;
    supplierSku?: string;
    leadTime?: number;
    minOrderQty?: number;
    unitCost?: number;
    lastPurchaseDate?: Date;
    notes?: string;
  };