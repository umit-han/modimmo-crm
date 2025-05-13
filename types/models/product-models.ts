import {
    Organisation,
    Inventory,
    SerialNumber,
    Supplier,
    ItemSupplier,
    PurchaseOrderLine,
    SalesOrderLine,
    TransferLine,
    AdjustmentLine,
    GoodsReceiptLine
} from "./index"

export type Category = {
    id: string;
    title: string;
    slug: string;
    imageUrl?: string;
    description?: string;
    parentId?: string;
    parent?: Category;
    subCategories: Category[];
    items: Item[];
    organisation: Organisation;
    orgId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type Unit = {
    id: string;
    name: string;
    symbol: string;
    items: Item[];
    organisation: Organisation;
    orgId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type Brand = {
    id: string;
    name: string;
    slug: string;
    items: Item[];
    organisation: Organisation;
    orgId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type TaxRate = {
    id: string;
    name: string;
    rate: number;
    items: Item[];
    organisation: Organisation;
    orgId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type Item = {
    id: string;
    name: string;
    slug: string;
    sku: string;
    barcode?: string;
    description?: string;
    dimensions?: string;
    weight?: number;
    salesCount: number;
    salesTotal: number;
    upc?: string;
    ean?: string;
    mpn?: string;
    isbn?: string;
    categoryId?: string;
    thumbnail?: string;
    imageUrls: string[];
    category?: Category;
    taxRateId?: string;
    tax?: number | null;
    taxRate?: TaxRate;
    brandId?: string;
    brand?: Brand;
    unitId?: string;
    unit?: Unit;
    unitOfMeasure?: string;
    costPrice: number;
    sellingPrice: number;
    minStockLevel: number;
    maxStockLevel?: number;
    isActive: boolean;
    isSerialTracked: boolean;
    organisation: Organisation;
    orgId: string;
    createdAt: Date;
    updatedAt: Date;
    
    // Relationships
    inventories: Inventory[];
    serialNumbers: SerialNumber[];
    supplierIds: string[];
    suppliers: Supplier[];
    supplierRelations: ItemSupplier[];
    purchaseOrderLines: PurchaseOrderLine[];
    salesOrderLines: SalesOrderLine[];
    transferLines: TransferLine[];
    adjustmentLines: AdjustmentLine[];
    goodsReceiptLines: GoodsReceiptLine[];
  };