// enums.ts
export enum LocationType {
    WAREHOUSE = 'WAREHOUSE',
    SHOP = 'SHOP',
    VIRTUAL = 'VIRTUAL'
  }
  
  export enum SerialStatus {
    IN_STOCK = 'IN_STOCK',
    SOLD = 'SOLD',
    RESERVED = 'RESERVED',
    DAMAGED = 'DAMAGED',
    RETURNED = 'RETURNED'
  }
  
  export enum PurchaseOrderStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
    RECEIVED = 'RECEIVED',
    CANCELLED = 'CANCELLED',
    CLOSED = 'CLOSED'
  }
  
  export enum GoodsReceiptStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  
  export enum SalesOrderStatus {
    DRAFT = 'DRAFT',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    RETURNED = 'RETURNED'
  }
  
  export enum Source {
    POS = 'POS',
    SALES_ORDER = 'SALES_ORDER'
  }
  
  export enum PaymentStatus {
    PENDING = 'PENDING',
    PARTIAL = 'PARTIAL',
    PAID = 'PAID',
    REFUNDED = 'REFUNDED'
  }
  
  export enum TransferStatus {
    DRAFT = 'DRAFT',
    APPROVED = 'APPROVED',
    IN_TRANSIT = 'IN_TRANSIT',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  
  export enum AdjustmentType {
    STOCK_COUNT = 'STOCK_COUNT',
    DAMAGE = 'DAMAGE',
    THEFT = 'THEFT',
    EXPIRED = 'EXPIRED',
    WRITE_OFF = 'WRITE_OFF',
    CORRECTION = 'CORRECTION',
    OTHER = 'OTHER'
  }
  
  export enum AdjustmentStatus {
    DRAFT = 'DRAFT',
    APPROVED = 'APPROVED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }