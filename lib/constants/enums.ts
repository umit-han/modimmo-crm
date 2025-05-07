export enum SalesOrderStatus {
    DRAFT = "DRAFT",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED"
} 

export enum PaymentStatus {
    PENDING = "PENDING",
    PARTIAL = "PARTIAL",
    UNPAID = "UNPAID",
    PAID = "PAID",
    REFUNDED = "REFUNDED",
}

export enum AdjustmentType {
    STOCK_COUNT = "STOCK_COUNT",
    DAMAGE = "DAMAGE",
    THEFT = "THEFT",
    EXPIRED = "EXPIRED",
    WRITE_OFF = "WRITE_OFF",
    CORRECTION = "CORRECTION",
    OTHER = "CORRECTION"
}

export enum TransferStatus {
    DRAFT = "DRAFT",
    APPROVED = "APPROVED",
    IN_TRANSIT = "IN_TRANSIT",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export enum LocationType {
    WAREHOUSE = "WAREHOUSE",
    SHOP = "SHOP",
    VIRTUAL = "VIRTUAL"
}